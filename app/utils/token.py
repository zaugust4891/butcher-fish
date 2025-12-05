from itsdangerous import URLSafeTimedSerializer
import uuid, time
from datetime import time, timedelta
from flask import current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token, get_jwt, decode_token
)
from app.database import db
from app.models import User

ACCESS_EXPIRES = timedelta(minutes=15)
REFRESH_EXPIRES = timedelta(days=14)

def _base_claims(user: User, scopes=None) -> dict:
    """Base claims for JWT tokens."""
    return {
        "email_verified": bool(user.email_verified),
        "scopes": scopes or [],
    }
def issue_token_pair(user: User, scopes=None, *, new_family: bool = True, family_id: str | None=None) -> tuple[str, str, str]:
    """Issue a new access and refresh token pair for the user."""
   
    claims = _base_claims(user, scopes)
    access_token = create_access_token(
        identity=user.user_id,
        additional_claims=r_claims,
        expires_delta=ACCESS_EXPIRES
    )
    
    if new_family or not family_id:
        family_id = uuid.uuid4().hex
    r_claims = claims | {"fid": family_id}
    refresh_token = create_refresh_token(
        identity=user.user_id,
        additional_claims=claims,
        expires_delta=ACCESS_EXPIRES
    )
    # Track the current refresh JTI for this family
    rt_jti = decode_token(refresh_token)["jti"]
    current_app.redis_client.setex(f"jwt:rt:{family_id}", int(REFRESH_EXPIRES.total_seconds()), rt_jti)
    
    return access_token, refresh_token, family_id

def revoke_token():
    jti = get_jwt.get().get("jti")
    exp = get_jwt.get().get("exp")
    ttl = int(exp - time.time())
    if jti and ttl:
        current_app.redis_client.setex(f"jwt:revoked:{jti}", ttl, "1")

def revoke_family(family_id: str):
    """Revoke all tokens in a family by setting the current refresh pointer to None."""
    current_app.redis_client.delete(f"jwt:rt:{family_id}")

def generate_verification_token(email, secret_key, salt):
    serializer = URLSafeTimedSerializer(secret_key)
    return serializer.dumps(email, salt=salt)

def confirm_verification_token(token, secret_key, salt, expiration=3600):
    serializer = URLSafeTimedSerializer(secret_key)
    try:
        email = serializer.loads(token, salt=salt, max_age=expiration)
    except:
        return None
    return email

def generate_password_reset_token(email, secret_key, salt):
    return generate_verification_token(email, secret_key, f"{salt}-pwreset")

def confirm_password_reset_token(token, secret_key, salt, expiration=3600):
    return confirm_verification_token(token, secret_key, f"{salt}-pwreset", expiration)

