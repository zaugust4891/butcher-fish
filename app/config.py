# app/config.py
import os
import secrets
import json


#TO DO: switch placeholder hardcoded creds with env vars. 
class EmailConfig:
    def __init__(self):    
        self.MAIL_SERVER = os.environ.get('MAIL_SERVER', 'zaugust4891@gmail.com')
        self.MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
        self.MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', True)
        self.MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
        self.MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
        self.MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', 'zaugust4891@gmail.com')

    def validate(self):
        if not self.MAIL_SERVER:
            raise ValueError("MAIL_SERVER is required")
        if not isinstance(self.MAIL_PORT, int) or self.MAIL_PORT <= 0:
            raise ValueError("MAIL_PORT must be a positive integer")


class SecurityConfig:
    def __init__(self):
        self._load_or_generate_keys()
    
    def _load_or_generate_keys(self):  
        key_file = 'dev_keys.json'
        if os.environ.get('SECRET_KEY') and os.environ.get('SECURITY_PASSWORD_SALT'):
            self.SECRET_KEY = os.environ.get('SECRET_KEY')
            self.SECURITY_PASSWORD_SALT = os.environ.get('SECURITY_PASSWORD_SALT')
        else:
            try:
                with open (key_file, 'r') as f:
                    keys = json.load(f)
                    self.SECRET_KEY = keys['SECRET_KEY']
                    self.SECURITY_PASSWORD_SALT = keys['SECURITY_PASSWORD_SALT']
            except(FileNotFoundError, KeyError, json.JSONDecodeError):
                self.SECRET_KEY = secrets.token_hex(32)
                self.SECURITY_PASSWORD_SALT = secrets.token_hex(16)
                with open(key_file, 'w') as f:
                    json.dump({
                        'SECRET_KEY': self.SECRET_KEY,
                        'SECURITY_PASSWORD_SALT': self.SECURITY_PASSWORD_SALT
                    }, f)
    
    def validate(self):
        if not self.SECRET_KEY:
            raise ValueError("SECRET_KEY is required") #TO do: set secret key 
        if not self.SECURITY_PASSWORD_SALT:
            raise ValueError("SECURITY_PASSWORD_SALT is required") #To do: set salt



class DatabaseConfig:
    def __init__(self): 
        self.SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI', 'postgresql://user:pass@localhost/dbname') #TO DO: add my user and pass 
        self.SQLALCHEMY_TRACK_MODIFICATIONS = False

    def validate(self):
        if not self.SQLALCHEMY_DATABASE_URI:
            raise ValueError("SQLALCHEMY_DATABASE_URI is required")
        

class RedisConfig:
    def __init__(self):    
        self.REDIS_HOST = os.environ.get('REDIS_HOST', 'localhost')
        self.REDIS_PORT = int(os.environ.get('REDIS_PORT', 6379))
        self.REDIS_DB = int(os.environ.get('REDIS_DB', 0))
    
    def validate(self):
        if not self.REDIS_HOST:
            raise ValueError("REDIS_HOST is required")
        if not isinstance(self.REDIS_PORT, int) or self.REDIS_PORT <= 0:
            raise ValueError("REDIS PORT must be a positve integer")

class Config:
    """Base configuration class composing all subsystem configurations."""
    def __init__(self):
        self.email = EmailConfig()
        self.security = SecurityConfig()
        self.database = DatabaseConfig()
        self.redis = RedisConfig()
    
    def validate(self):
        self.email.validate()
        self.security.validate()
        self.database.validate()
        self.redis.validate()

    def to_flask_config(self):
        """Return a dictionary of settings for Flask app.config"""
        return {
            'MAIL_SERVER': self.email.MAIL_SERVER,
            'MAIL_PORT': self.email.MAIL_PORT,
            'MAIL_USE_TLS': self.email.MAIL_USE_TLS,
            'MAIL_USERNAME': self.email.MAIL_USERNAME,
            'MAIL_PASSWORD': self.email.MAIL_PASSWORD,
            'MAIL_DEFAULT_SENDER': self.email.MAIL_DEFAULT_SENDER,
            'SECRET_KEY': self.security.SECRET_KEY,
            'SECURITY_PASSWORD_SALT': self.security.SECURITY_PASSWORD_SALT,
            'SQLALCHEMY_DATABASE_URI': self.database.SQLALCHEMY_DATABASE_URI,
            'SQLALCHEMY_TRACK_MODIFICATIONS': self.database.SQLALCHEMY_TRACK_MODIFICATIONS,
            'REDIS_HOST': self.redis.REDIS_HOST,
            'REDIS_PORT': self.redis.REDIS_PORT,
            'REDIS_DB': self.redis.REDIS_DB,
        }

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = True


class ProductionConfig(Config):
    DEBUG = False
    def __init__(self):
        super().__init__()
        required_vars = ['SECRET_KEY', 'SECURITY_PASSWORD_SALT', 'DATABASE_URI']
        for var in required_vars:
            if not os.environ.get(var):
                raise ValueError(f"{var} must be set in environment variables")






