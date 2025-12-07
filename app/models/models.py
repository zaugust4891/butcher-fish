from app.database import db
from app.mixins import SoftDeleteMixin
from datetime import datetime

# Market Model
class Market(SoftDeleteMixin, db.Model):
    __tablename__ = 'markets'
    market_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50), nullable=False)

    account = db.relationship(
        'MarketAccount',
        back_populates='market',
        uselist=False,
        lazy='joined'
    )

    __table_args__ = (
        db.Index(
            "uix_market_addr_active",
            "name",
            "address",
            unique=True,
            postgresql_where=db.text("is_active = TRUE"),
        ),
    )

    @classmethod
    def active_query(cls):
        """Shortcut for common pattern `Market.query.filter_by(is_active=True)`."""
        return cls.query.filter_by(is_active=True)

# User Model
class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    email_verified = db.Column(db.Boolean, default=False, nullable=False)
    role = db.Column(db.String(32), nullable=False, default="user", index=True)  # 'user', 'admin', etc.
    totp_secret = db.Column(db.String(64), nullable=True)
    two_factor_enabled = db.Column(db.Boolean, nullable=False, default=False)  # 'user', 'admin', etc.
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    @classmethod
    def has_role(self, *roles: str) -> bool:
        return (self.role or "user") in roles
    
# Review Model
class Review(db.Model):
    __tablename__ = 'reviews'
    review_id = db.Column(db.Integer, primary_key=True)
    market_id = db.Column(db.Integer, db.ForeignKey('markets.market_id', ondelete="CASCADE"), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete="CASCADE"), nullable=False, index=True)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())
    sentiment_score = db.Column(db.Float)

    market = db.relationship('Market', backref=db.backref('reviews', lazy=True))
    user = db.relationship('User', backref=db.backref('reviews', lazy=True))

    __table_args__ = (
        db.CheckConstraint("rating BETWEEN 1 AND 5", name="chk_rating_1_5"),
    )

# Market Account Model
class MarketAccount(db.Model):
    __tablename__ = 'market_accounts'
    account_id = db.Column(db.Integer, primary_key=True)
    market_id = db.Column(db.Integer, db.ForeignKey('markets.market_id', ondelete="CASCADE"), unique=True, nullable=False, index=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    contact_email = db.Column(db.String(100), nullable=False)
    contact_phone = db.Column(db.String(20))

    market = db.relationship(
        'Market',
        back_populates='account',
        uselist=False,
        cascade='all, delete-orphan'
    )

# Menu Item Model
class MenuItem(db.Model):
    __tablename__ = 'menu_items'
    item_id = db.Column(db.Integer, primary_key=True)
    market_id = db.Column(db.Integer, db.ForeignKey('markets.market_id', ondelete="CASCADE"), nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    category = db.Column(db.String(50))

    market = db.relationship('Market', backref=db.backref('menu_items', lazy=True))

# Message Model
class Message(db.Model):
    __tablename__ = 'messages'
    message_id = db.Column(db.Integer, primary_key=True)
    sender_type = db.Column(db.String(10), nullable=False)  # 'user' or 'market'
    sender_id = db.Column(db.Integer, nullable=False)
    recipient_type = db.Column(db.String(10), nullable=False)  # 'user' or 'market'
    recipient_id = db.Column(db.Integer, nullable=False)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

# Verification Document Model
class VerificationDocument(db.Model):
    __tablename__ = 'verification_documents'
    document_id = db.Column(db.Integer, primary_key=True)
    market_id = db.Column(db.Integer, db.ForeignKey('markets.market_id'))
    document_type = db.Column(db.String(50), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    upload_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), nullable=False)  # 'Pending', 'Approved', 'Rejected'

    market = db.relationship('Market', backref=db.backref('verification_documents', lazy=True))
