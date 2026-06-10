from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.models.database import SessionLocal
from app.models.models import User, RefreshToken
from app.routes.auth_utils import (
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


from pydantic import BaseModel
from app.routes.auth_utils import hash_password, verify_password


class LoginRequest(BaseModel):
    phone: str
    password: str


@router.post("/login")
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db)
):

    phone = payload.phone
    password = payload.password

    if not phone or not password:
        raise HTTPException(status_code=400, detail="Missing phone or password")

    user = db.query(User).filter(User.phone == phone).first()

    if not user:
        # Register new user with provided phone and password
        user = User(
            firebase_uid=None,
            phone=phone,
            name=None,
            password_hash=hash_password(password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Verify password
        if not verify_password(password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid credentials")

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
