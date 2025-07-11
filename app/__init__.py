from flask import Flask
from flask_migrate import Migrate
from flask_mail import Mail
from app.config import DevelopmentConfig, ProductionConfig
from app.database import db
import redis
import os
from dotenv import load_dotenv

load_dotenv()

mail = Mail()

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
    
    db.init_app(app)
    mail.init_app(app)

    # Import models after db initialization to avoid circular imports
    from app.models import Market, User, Review, MarketAccount, MenuItem, Message, VerificationDocument

    Migrate(app, db)
    
    redis_client = redis.Redis(
        host=app.config['REDIS_HOST'],
        port=app.config['REDIS_PORT'],
        db=app.config['REDIS_DB']
    )
    app.redis_client = redis_client

    # Register Blueprints
    from app.routes import auth_bp, reviews_bp, butchers_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(butchers_bp)
    app.register_blueprint(reviews_bp)

    return app
