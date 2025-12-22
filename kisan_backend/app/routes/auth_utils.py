# app/routes/auth_utils.py
import os
import json
from datetime import datetime, timedelta
import hashlib
import secrets

import firebase_admin
from firebase_admin import auth as fb_auth, credentials
from jose import jwt

# Config from env
FIREBASE_CRED_JSON = os.environ.get("FIREBASE_CRED_JSON", "./firebase_admin.json")
SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM = os.environ.get("ALGORITHM", "HS256")
ACCESS_EXPIRE_MINUTES = int(os.environ.get("ACCESS_EXPIRE_MINUTES", "60"))

# Initialize firebase admin once
if not firebase_admin._apps:
    if os.path.exists(FIREBASE_CRED_JSON):
        cred = credentials.Certificate(FIREBASE_CRED_JSON)
        firebase_admin.initialize_app(cred)
    else:
        # try to parse as JSON string (if user put JSON in env)
        try:
            cred_dict = json.loads(FIREBASE_CRED_JSON)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
        except Exception as e:
            raise RuntimeError(f"Firebase credentials not found or invalid. Set FIREBASE_CRED_JSON to file path or JSON string. Err: {e}")

def verify_firebase_token(id_token: str):
    """
    Verifies the Firebase ID token and returns decoded token dict.
    Raises Exception on failure.
    """
    decoded = fb_auth.verify_id_token(id_token)
    return decoded

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    now = datetime.utcnow()
    expire = now + (expires_delta if expires_delta else timedelta(minutes=ACCESS_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "iat": now})
    encoded = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded

def create_refresh_token():
    # simple random token; we store hash in DB
    return secrets.token_urlsafe(32)

def hash_token(token: str):
    return hashlib.sha256(token.encode()).hexdigest()
