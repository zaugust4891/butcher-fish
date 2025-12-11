from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import event, and_, func
from sqlalchemy.dialects.postgresql import ARRAY
from app.database import db


class UserProfile(db.Model):
    """
    Stores user presentation and social metadata.

    This is intentionally separate from the User model to:
    1. Allow independent caching strategies (profiles are read-heavy)
    2. Keep auth-related updates isolated from profile updates
    3. Enable adding social features without touching security-critical tables.

    The denormalized counts(follower_count, etc.) are updated via database triggers 
    or application-level events. 
    This trades write complexity for read-performance - displaying "10k followers" shouldn't require a COUNT query on every page load.

    """

    __tablename__ = "user_profiles"

    # Primary key - separate from user_id to allow for potential
    # future scenarios (profile archival, etc.)
    profile_id = db.Column(db.Integer, primary_key=True)
    
    #Foreign key to User - this is the critical link
    # UNIQUE constraint ensures one profile per user
    # CASCADE delete means profile dies when user is deleted
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    # === Display Information ===
    # display_name is separate from username - usernames are immutable
    # identifiers, display names are flexible presentation

    display_name = db.Column(db.String(100), nullable=True)

    # Bio supports longer text - think Twitter bio or Instagram description
    bio = db.Column(db.Text, nullable=True)

    # URLs to cloud-stored images (S3, Cloudflare R2, etc.)
    # We store URLs, not binary data - images are served via CDN
    avatar_url = db.Column(db.String(500), nullable=True)
    cover_photo_url = db.Column(db.String(500), nullable=True)

    # === Location (Optional) ===
    # Separate city/state allows for location-based features later
    # (e.g., "foodies near you", "top reviewers in Austin")
    location_city = db.Column(db.String(100), nullable=True)
    location_state = db.Column(db.String(50), nullable=True)


    # === Preferences and interests ===
    #PostgreSQL ARRAY type - stores lists natively without join tables.
    # Example: ['butcher', 'seafood', 'italian']
    dietary_preferences = db.Column(ARRAY(db.String(50)), nullable=True)
    favorite_cuisines = db.Column(ARRAY(db.String(50)), nullable=True)

    # === Expertise and Trust ===
    # Tags earned through quality reviews in specific categories
    # Example: ['dry_aged_beef_expert', 'seafood_connoisseur']
    expertise_tags = db.Column(ARRAY(db.String(50)))

    # Manual verification flag - awarded by admins to trusted reviewers
    # Think Twitter's blue checkmark, but for food expertise

    verified_foodie = db.Column(db.Boolean, default=False, nullable=False)

    # === Privacy Settings == 
    # When False, progile is only visible to followers. 
    is_public = db.Column(db.Boolean, default=True, nullable=False)

    # === Denormalized Statistics ===
    # These are updated by triggers/events, not computed on read
    # Trading write complexity for read performance
    review_count = db.Column(db.Integer, default=0, nullable=False)
    follower_count = db.Column(db.Integer, default=0, nullable=False)
    following_count = db.Column(db.Integer, default=0, nullable=False)
    helpful_votes_received = db.Column(db.Integer, default=0, nullable=False)
    
    # === Timestamps ===
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    # === Relationships ===
    # backref creates User.profile automatically
    # uselist=False because this is one-to-one
    # lazy='joined' means profile loads with user in single query
    user = db.relationship(
        'User',
        backref=db.backref('profile', uselist=False, lazy='joined')
    )

    def __repr__(self):
        return f'<UserProfile {self.profile_id} for User {self.user_id}>'
    
    # TO DO ITEMS:
    # === Computed Properties ===
    # === Class Methods for Common Queries ===


class Follow(db.Model):
    """User-to-user follow relationships"""
    __tablename__ = "follows"
    
    follower_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id", ondelete="CASCADE"),
        primary_key=True
    )
    followed_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id", ondelete="CASCADE"),
        primary_key=True
    )
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    def __repr__(self):
        return f'<Follow {self.follower_id} -> {self.followed_id}>'


class MarketFollow(db.Model):
    """User-to-market follow relationships"""
    __tablename__ = "market_follows"
    
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.user_id", ondelete="CASCADE"),
        primary_key=True
    )
    market_id = db.Column(
        db.Integer,
        db.ForeignKey("markets.market_id", ondelete="CASCADE"),
        primary_key=True
    )
    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    def __repr__(self):
        return f'<MarketFollow {self.user_id} -> Market {self.market_id}>'