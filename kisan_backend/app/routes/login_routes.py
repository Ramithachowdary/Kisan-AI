from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.models.database import SessionLocal
from app.models.models import User, RefreshToken
from app.routes.auth_utils import (
    verify_firebase_token,
    create_access_token,
    create_refresh_token,
    hash_token,
)

router = APIRouter(prefix="/auth", tags=["Auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
def is_profile_complete(user: User):
    return all([
        user.name,
        user.state,
        user.district,
        user.village,
        user.land_size,
        user.crops,
        user.language
    ])


@router.post("/login")
def login_firebase(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing auth token")

    firebase_token = authorization.split(" ")[1]

    try:
        decoded = verify_firebase_token(firebase_token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Firebase token: {e}")

    firebase_uid = decoded.get("uid")
    phone = decoded.get("phone_number")

    if not firebase_uid:
        raise HTTPException(status_code=400, detail="Invalid Firebase UID")

    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()

    if not user:
        user = User(
            firebase_uid=firebase_uid,
            phone=phone,
            name=None
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Issue tokens
    access_token = create_access_token({"sub": str(user.id)})

    refresh_raw = create_refresh_token()
    refresh_hash = hash_token(refresh_raw)

    refresh_item = RefreshToken(
        user_id=user.id,
        token_hash=refresh_hash,
        created_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(days=30),
    )

    db.add(refresh_item)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_raw,
        "profile_complete": is_profile_complete(user)
    }
