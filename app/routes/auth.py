import time
from flask import (
    Blueprint,
    request,
    jsonify,
    current_app,
)
from flask_jwt_extended import (
    jwt_required,
    get_jwt,
    get_jwt_identity,
)
from app.models.models import User
from app.database import db
from app.utils import (
    PasswordUtil,
    send_verification_email,
    confirm_verification_token,
    send_password_reset_email,
)
from app.utils.token import (
    issue_token_pair,
    revoke_current_token,
    revoke_family,
)
from app.utils.cache import redis_client
from app.utils.password import make_reset_token, parse_reset_token

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json or {}
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Email, username, and password are required."}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists."}), 400

    hashed_password = PasswordUtil.hash_password(password)
    new_user = User(username=username, email=email, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    try:
        # Use your utility function (single source of truth)
        send_verification_email(new_user.email)
    except Exception as e:
        current_app.logger.error(f"Failed to send verification email: {e}")
        return jsonify({"error": "Failed to send verification email."}), 500

    return jsonify({"message": "User registered successfully"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    # Allow login via username OR email (tiny UX upgrade)
    user = User.query.filter((User.username == username) | (User.email == username)).first()

    # Keep your PasswordUtil call order as in your codebase
    if not user or not PasswordUtil.verify_password(user.password_hash, password):
        return jsonify({"error": "Invalid username or password"}), 401

    access, refresh, family_id = issue_token_pair(user)
    return jsonify(
        {
            "access_token": access,
            "refresh_token": refresh,
            "family_id": family_id,
        }
    ), 200


@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    revoke_current_token()
    return jsonify({"message": "Logged out"}), 200


@auth_bp.post('/logout')
@jwt_required(optional=True)
def logout():
    # Revoke current token if present
    try:
        revoke_current_token()
    except Exception:
        pass
    return jsonify({"message": "Logged out"})


@auth_bp.post('/logout-all')
@jwt_required()
def logout_all():
    uid = get_jwt()["sub"]
    now = int(time.time())
    redis_client.set(f"jwt:user_logout_after:{uid}", now)
    return jsonify({"message": "All sessions invalidated"})


@auth_bp.post('/token/refresh')
@jwt_required(refresh=True)
def refresh_token():
    claims = get_jwt()
    user_id = claims["sub"]
    family_id = claims.get("fid")
    current_jti = claims.get("jti")

    # 1) Rotation check
    stored = redis_client.get(f"jwt:rt:{family_id}")
    if not family_id or not stored:
        # Family missing → treat as invalid; require login
        return jsonify({"error": "Refresh family invalid"}), 401

    if stored.decode() != current_jti:
        # Reuse detected → kill family and revoke this token
        revoke_current_token()
        revoke_family(family_id)
        return jsonify({"error": "Refresh token reuse detected. Please login again."}), 401

    # 2) Rotate: issue new pair with SAME family
    from app.models.models import User
    user = User.query.get(user_id)
    access, new_refresh, _ = issue_token_pair(user, scopes=claims.get("scopes", []), new_family=False, family_id=family_id)

    # Revoke old refresh (current one) & update stored jti is done in issue_token_pair
    revoke_current_token()

    return jsonify({"access": access, "refresh": new_refresh})


@auth_bp.route("/verify_email", methods=["GET"])
def verify_email():
    token = request.args.get("token")
    if not token:
        return jsonify({"error": "Token is missing"}), 400

    email = confirm_verification_token(
        token,
        current_app.config["SECRET_KEY"],
        current_app.config["SECURITY_PASSWORD_SALT"],
    )
    if not email:
        return jsonify({"error": "Token is invalid or expired"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Keep field name consistent with your model (you used email_verified here)
    user.email_verified = True
    db.session.commit()
    return jsonify({"message": "Email verified successfully"}), 200


@auth_bp.route("/forgot_password", methods=["POST"])
def forgot_password():
    """Send password reset email."""
    data = request.json or {}
    email = data.get("email")
    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        # Don't leak account existence
        return jsonify({"message": "If email exists, a password reset link has been sent to your email."}), 200

    try:
        send_password_reset_email(user.email)
        return jsonify({"message": "If email exists, a password reset link has been sent to your email."}), 200
    except Exception as e:
        current_app.logger.error(f"Password reset email failed: {e}")
        return jsonify({"error": "Email service unavailable"}), 500


@auth_bp.post('/reset-password')
def reset_password():
    d = request.get_json() or {}
    token = d.get('token')
    new_password = d.get('password')
    try:
        uid = parse_reset_token(current_app.config['JWT_SECRET_KEY'], token, max_age=3600)
    except Exception:
        return jsonify({"error": "Invalid or expired token"}), 400

    user = User.query.get(uid)
    if not user:
        return jsonify({"error": "User not found"}), 404

    from app.utils import PasswordUtil
    user.password_hash = PasswordUtil.hash_password(new_password)
    db.session.commit()

    # Force relogin on all devices after password change
    redis_client.set(f"jwt:user_logout_after:{user.id}", int(time.time()))
    return jsonify({"message": "Password updated. Please login."})


@auth_bp.post('/request-password-reset')
def request_password_reset():
    email = (request.get_json() or {}).get('email','').lower()
    user = User.query.filter_by(email=email).first()
    if not user:
        # Don’t reveal if email exists
        return jsonify({"message": "If an account exists, a reset email has been sent."})
    token = make_reset_token(current_app.config['JWT_SECRET_KEY'], user.id)
    link = url_for('auth.reset_password', token=token, _external=True)
    send_async_email(to=user.email, subject="Reset your password", html=f"Click: <a href='{link}'>reset</a>")
    return jsonify({"message": "If an account exists, a reset email has been sent."})


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    """Lightweight current-user endpoint for frontend/session checks."""
    uid = get_jwt_identity()
    user = db.session.get(User, uid)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return (
        jsonify(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "email_verified": getattr(user, "email_verified", False),
                "role": getattr(user, "role", "user"),
            }
        ),
        200,
    )
