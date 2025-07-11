from itsdangerous import URLSafeTimedSerializer


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

