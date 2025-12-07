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

    display_name = db.Column(db.String(100), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    avatar_url = db.Column(db.String(255), nullable=True)
    banner_url = db.Column(db.String(255), nullable=True)
    location = db.Column(db.String(100), nullable=True)
    website_url = db.Column(db.String(255), nullable=True)

    follower_count = db.Column(db.Integer, default=0, nullable=False)
    following_count = db.Column(db.Integer, default=0, nullable=False)
    market_count = db.Column(db.Integer, default=0, nullable=False)

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    user = db.relationship("User", back_populates="profile")