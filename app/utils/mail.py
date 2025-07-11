from flask import url_for, current_app
from flask_mail import Message
from app.utils.token import (generate_verification_token, generate_password_reset_token)


def send_verification_email(user_email):
    token = generate_verification_token(
        user_email,
        current_app.config['SECRET_KEY'],
        current_app.config['SECURITY_PASSWORD_SALT']
    )
    verify_url = url_for('auth.verify_email', token=token, _external=True)
    _dispatch(
        "Email Verification",
        user_email,
        f"Welcome! Click to verify you email: {verify_url}",
    )

def send_password_reset_email(user_email):
    token = generate_password_reset_token(
        user_email,
        current_app.config["SECRET_KEY"],
        current_app["SECURITY_PASSWORD_SALT"],
    )
    reset_url = url_for("auth.reset_password", token=token, _external=True)
    _dispatch(
        "Reset your password",
        user_email,
        f"Click to choose a new password: {reset_url}",
    )

def _dispatch(subject, recipient, body):
    msg = Message(subject, recipients=[recipient], body=body)
    current_app.mail.send(msg)
    
