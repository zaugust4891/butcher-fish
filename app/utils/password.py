# app/utils/password.py
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

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
