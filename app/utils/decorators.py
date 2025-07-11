from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import jsonify
from app.models import User
from app.database import db 

def verified_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        if not user or not user.email_verified:
            return jsonify({"error": "Email not verified"}), 403
        return fn(*args, **kwargs)
    return wrapper