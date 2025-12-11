from flask import Flask
from flask_migrate import Migrate
from flask_mail import Mail
from app.config import DevelopmentConfig, ProductionConfig
from flask_jwt_extended import JWTManager
from flask import current_app
from app.database import db
import redis
import os
from dotenv import load_dotenv

load_dotenv()
jwt = JWTManager()
mail = Mail()

@jwt.token_in_blocklist_loader
def is_token_revoked(jwt_header, jwt_payload: dict) -> bool:
    jti = jwt_payload["jti"]
   

def create_app():
    app = Flask(__name__)
    env = os.environ.get('FLASK_ENV', 'development')
    if env == 'production':
        config = ProductionConfig()
    else:
        config = DevelopmentConfig()
    config.validate()
    app.config.update(config.to_flask_config())
    if hasattr(config, 'DEBUG'):
        app.config['DEBUG'] = config.DEBUG
    if hasattr(config, 'SQLALCHEMY_ECHO'):
        app.config['SQLALCHEMY_ECHO'] = config.SQLALCHEMY_ECHO
    app.config.setdefault('JWT_SECRET_KEY', config.JWT_SECRET_KEY)
    
    jwt.init_app(app)

    @jwt.token_in_blocklist_loader
    def is_token_revoked(jwt_header, jwt_payload: dict) -> bool:
        jti = jwt_payload["jti"]
        if not jti:
            return True # No JTI means token is not valid
        return current_app.redis_client.get(f"jwt:revoked:{jti}") is not None

    db.init_app(app)
    mail.init_app(app)

    # Import models after db initialization to avoid circular imports
    # core models
    from app.models.models import (
        Market,
        User,
        Review,
        MarketAccount,
        MenuItem,
        Message,
        VerificationDocument,
    )

    # Profile and social graph models
    from app.models.profile import (
        UserProfile,
        Follow,
        MarketFollow,
    )

    __all__ = [
        # Core models
        'Market',
        'User',
        'Review',
        'MarketAccount',
        'MenuItem',
        'Message',
        'VerificationDocument',
        
        # Profile models
        'UserProfile',
        'Follow',
        'MarketFollow',
    ]

    Migrate(app, db)
    
    redis_client = redis.Redis(
        host=app.config['REDIS_HOST'],
        port=app.config['REDIS_PORT'],
        db=app.config['REDIS_DB']
    )
    app.redis_client = redis_client

    # Register Blueprints
    from app.routes import auth_bp, reviews_bp, markets_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(markets_bp)
    app.register_blueprint(reviews_bp)

    return app
