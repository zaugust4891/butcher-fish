import math
from flask import current_app
from app.database import db
from app.models.models import Market, Review
from app.utils.cache import redis_client

# plain dict that lets you tweak the influence of each factor without changing code further down.
# Later we can load these numbers from env variables or even Redis hash for live A/B testing.
WEIGHTS = {
    "avg_rating": 0.6,
    "avg_sentiment": 0.3,
    "review_ct": 0.1,
}

#Private helper: Given already averaged-values, return a single "popularity" number.
def _composite(avg_rating, avg_sent, review_ct):
    '''Return a 0-10 popularity score.'''
    score = (
        avg_rating * WEIGHTS["avg_rating"] +
        (avg_sent + 1) * 2.5 * WEIGHTS["avg_sentiment"] +
        math.log(review_ct + 1, 10) * 10 * WEIGHTS["review_ct"]
    )

    return round(score, 4)

#Public function we call right after one new review is committed.
def update_leaderboard(market_id, rating, sentiment):
    """Update the leaderboard for a market after a new review.

    This function uses redis_client() from cache module which requires
    an application context.
    """
    client = redis_client()
    hkey = f"market:{market_id}:stats" # store running totals in one Redis Hash per market. ex hash: market:42:stats
    pipe = client.pipeline() # opens redis pipeline, which allows multiple commands sent as on round trip, guaranteeing atomicity from the clien's point of view and saving network latency.
    pipe.hincrbyfloat(hkey, "rating_sum", rating) # adds the new 1-5 integer
    pipe.hincrbyfloat(hkey, "sent_sum", sentiment) # adds the sentiment float
    pipe.hincrbyfloat(hkey, "count", 1) # Increments total reviews
    #Sums instead of averages because sums let us keep integer math and update in O(1) without reading.
    pipe.hgetall(hkey) #hgetall is queued last. .execute() runs the pipeline and returns a list of results.
    data = pipe.execute()[-1] # dict after update
    # [-1] is that dict containing the post-increment values,  e.g.: {b'rating_sum': b'127', b'sent_sum': b'23.5', b'count': b'28'}
    #convert byte strings into python numbers
    rating_sum = float(data.get(b"rating_sum", 0))
    sent_sum = float(data.get(b"sent_sum", 0))
    review_ct = int(data.get(b"count", 0))

    if review_ct == 0:
        return  # Avoid division by zero

    #compute fresh per-market averages without touching Postgres.
    avg_rating = rating_sum / review_ct
    avg_sent = sent_sum / review_ct
    score = _composite(avg_rating, avg_sent, review_ct)

    #one call gives the leaderboard score
    client.zadd("leaderboard", {market_id: score})

    #Write into a global Redis ZSET:
    #key: "leaderboard"
    #member: the intege market_id
    #score: the composite popularity

    #Redis ZSET's keep their members sorted by score, so later a simple:
    #client.zrevrange("leaderboard", 0, 9, withscores=True)
    #returns the top 10 markets in descending order.


def rebuild_leaderboard():
    """Rebuild the entire leaderboard from database.

    This function can be called as a Celery task or directly.
    Requires an application context.
    """
    client = redis_client()
    pipe = client.pipeline()
    pipe.delete("leaderboard")
    for m in Market.active_query():
        stats = db.session.query(
            db.func.avg(Review.rating).label("avg_rating"),
            db.func.avg(Review.sentiment_score).label("avg_sent"),
            db.func.count().label('review_ct')
        ).filter_by(market_id=m.market_id).one()
        score = _composite(stats.avg_rating, stats.avg_sent, stats.review_ct)
        pipe.zadd("leaderboard", {m.market_id: score})
    pipe.execute()
    