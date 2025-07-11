from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import select
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from app.database import db
from app.models import Review

analyzer = SentimentIntensityAnalyzer()
reviews_bp = Blueprint('reviews', __name__)

@reviews_bp.route('/<int:market_id>/review', methods=['POST'])
@jwt_required()
def post_review(market_id):
    redis_client = current_app.redis_client
    user_id = get_jwt_identity()
    data = request.json
    review_text = data.get('review')
    rating = data.get('rating')

    if not review_text or rating is None:
        return jsonify({'error': 'Review text and rating are required.'}), 400

    sentiment_score = analyzer.polarity_scores(review_text)['compound']

    new_review = Review(butcher_id=butcher_id, user_id=user_id, comment=review_text, rating=rating, sentiment_score=sentiment_score)
    db.session.add(new_review)
    db.session.commit()

    return jsonify({'message': 'Review posted successfully'}), 201
