from flask import Blueprint, jsonify, request, current_app
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from app.database import db
from app.models.models import Market, Review
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from app.utils.cache import redis_cache
from app.validators.validators import MarketSchema

analyzer = SentimentIntensityAnalyzer()
markets_bp = Blueprint('markets', __name__)

@markets_bp.route('/', methods=['GET'])
@redis_cache(lambda: 'markets_all', ttl=300) #Note- whenver you write a market or soft-delete one, remember to redis_client.delete('markets_all)
def get_all_markets():
    markets = db.session.execute(select(Market)).scalars().all()
    return jsonify([{
        'id': market.market_id,
        'name': market.name,
        'address': market.address,
        'type': market.type
    } for market in markets]), 200


@markets_bp.route('/', methods=['POST'])
@jwt_required()
def create_market():
    """Create a new market. Requires authentication."""
    schema = MarketSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify({'error': err.messages}), 400

    name = data.get('name')
    address = data.get('address')
    market_type = data.get('type')

    new_market = Market(name=name, address=address, type=market_type)

    try:
        db.session.add(new_market)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'A market with this name and address already exists.'}), 409

    # Invalidate the markets cache so the new market appears immediately
    redis_client = current_app.redis_client
    redis_client.delete('markets_all')

    return jsonify({
        'message': 'Market created successfully',
        'market': {
            'id': new_market.market_id,
            'name': new_market.name,
            'address': new_market.address,
            'type': new_market.type
        }
    }), 201


@markets_bp.route('/<int:market_id>/sentiment', methods=['GET'])
def get_sentiment(market_id):
    reviews = db.session.execute(select(Review).where(Review.market_id == market_id)).scalars().all()
    if not reviews:
        return jsonify({'error': 'No reviews found'}), 404

    avg_sentiment = sum(r.sentiment_score for r in reviews) / len(reviews)
    return jsonify({'market_id': market_id, 'average_sentiment': avg_sentiment, 'reviews_count': len(reviews)}), 200

@markets_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    redis_client = current_app.redis_client  # Access redis_client via current_app
    leaderboard = redis_client.zrevrange('leaderboard', 0, -1, withscores=True)
    leaderboard_list = [
        {'id': int(market_id), 'score': score} for market_id, score in leaderboard
    ]
    return jsonify({'leaderboard': leaderboard_list}), 200