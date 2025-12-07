from flask import Blueprint, request, jsonify, current_app
from marshmallow import ValidationError
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import select
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from app.database import db
from app.models.models import Review
from app.utils.leaderboard import update_leaderboard
from app.models.validators.validators import ReviewSchema

analyzer = SentimentIntensityAnalyzer()
reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('/<int:market_id>/review', methods=['POST'])
@jwt_required()
def post_review(market_id):
    schema = ReviewSchema()
    try:
        data = schema.load(request.json)
    except ValidationError as err:
        return jsonify(err.messages), 400
    redis_client = current_app.redis_client
    user_id = get_jwt_identity()
    data = request.json
    review_text = data.get('review')
    rating = data.get('rating')

    if not review_text or rating is None:
        return jsonify({'error': 'Review text and rating are required.'}), 400

    sentiment_score = analyzer.polarity_scores(review_text)['compound']

    new_review = Review(market_id=market_id, user_id=user_id, comment=review_text, rating=rating, sentiment_score=sentiment_score)
    db.session.add(new_review)
    db.session.commit()
    update_leaderboard(redis_client, market_id, rating, sentiment_score)

    return jsonify({'message': 'Review posted successfully'}), 201
