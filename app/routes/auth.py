from flask import (
    Blueprint, 
    request,
    jsonify,
    url_for,
    current_app
)
from itsdangerous import URLSafeTimedSerializer
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app.models import User
from app.database import db
from app.utils import PasswordUtil, send_verification_email, confirm_verification_token, send_password_reset_email


auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'error': 'Email, username, and password are required.'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists.'}), 400

    hashed_password = PasswordUtil.hash_password(password)
    new_user = User(username=username, email=email, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    try:
        send_verification_email(new_user.email)
    except Exception as e:
        current_app.logger.error(f"Failed to send verification email: {e}")
        return jsonify({'error': 'Failed to send verification email.'}), 500


    return jsonify({'message': 'User registered successfully'}), 201



@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Missing username or password'}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not PasswordUtil.verify_password(user.password_hash, password):
        return jsonify({'error': 'Invalid username or password'}), 401

    access_token = create_access_token(identity=user.user_id)
    refresh_token = create_refresh_token(identity=user.user_id)

    return jsonify({'access_token': access_token, 'refresh_token': refresh_token}), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)

def refresh():
    current_user = get_jwt_identity()
    access_token = create_access_token(identity=current_user)
    return jsonify({'access_token': access_token}), 200


@auth_bp.route('/verify_email', methods=['GET'])
def verify_email():
    token = request.args.get('token')
    if not token:
        return jsonify({'error': 'Token is missing'}), 400
    email = confirm_verification_token(
        token,
        current_app.config['SECRET_KEY'],
        current_app.config['SECURITY_PASSWORD_SALT']
    )
    if not email:
        return jsonify({'error': 'Token is invalid or expired'}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user.email_verified = True
    db.session.commit()
    return jsonify({'message': 'Email verified successfully'}), 200


@auth_bp.route('/forgot_password', methods=['POST'])
def forgot_password():
    '''send password reset email'''
    data = request.json
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'If email exists, a password reset link has been sent to your email.'}), 200
    
    try:
        send_password_reset_email(user.email)
        return jsonify({'message': 'If email exists, a passowrd reset link has been sent to your email.'}), 200
    except Exception as e:
        current_app.logger.error(f"Password reset email failed: {e}"), 200
        return jsonify({'error': 'Email service unavailable'}), 500
                                

@auth_bp.route('/reset_password', methods=['POST'])
def reset_password():
    '''Reset password with valid token'''
    data = request.json
    token = data.get('token')
    new_password = data.get('password')
    if not token or not new_password:
        return jsonify({'error': 'Token and password required'}), 400
    from app.utils.token import confirm_password_reset_token
    email = confirm_password_reset_token(
        token,
        current_app.config['SECRET_KEY'],
        current_app.config['SECURITY_PASSWORD_SALT']
    )

    if not email:
        return jsonify({'error': 'Invalid or expired token'}), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user.password_hash = PasswordUtil.hash_password(new_password)
    db.session.commit()

    return jsonify({'message': 'Password reset successfully'}), 200



#NEXT: def reset_password():

