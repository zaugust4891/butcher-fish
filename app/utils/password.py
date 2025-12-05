# app/utils/password.py
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from itsdangerous import URLSafeTimedSerializer

ph = PasswordHasher()

class PasswordUtil:
    @staticmethod
    def hash_password(password):
        return ph.hash(password)

    @staticmethod
    def verify_password(hash, password):
        try:
            return ph.verify(hash, password)
        except VerifyMismatchError:
            return False

def make_reset_token(secret_key: str, user_id: int) -> str:
    s = URLSafeTimedSerializer(secret_key, salt='pwd-reset')
    return s.dumps({"uid": user_id})


def parse_reset_token(secret_key: str, token: str, max_age=3600) -> int | None:
    s = URLSafeTimedSerializer(secret_key, salt='pwd-reset')
    data = s.loads(token, max_age=max_age)
    return int(data['uid'])