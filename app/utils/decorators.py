from functools import wraps
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request, get_jwt
from flask import jsonify
from app.models import User
from app.database import db 

def verified_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        if not claims.get("email_verified", False):
            return jsonify({"msg": "Email verification required"}), 403
        return fn(*args, **kwargs)
    return wrapper

def requires_role(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            user_roles = set(claims.get("roles", []))
            if not user_roles.intersection(set(roles)):
                return jsonify({"error": "Insufficient role."}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator



def requires_scopes(*need):
    def deco(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            have = set(claims.get("scopes", []))
            if not set(need).issubset(have):
                return jsonify({"error": "Missing required scope(s)."}), 403
            return fn(*args, **kwargs)
        return wrapper
    return deco
