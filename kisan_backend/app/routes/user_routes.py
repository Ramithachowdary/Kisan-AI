from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.database import SessionLocal
from app.models.models import User
from app.schemas.user_schema import UserProfileUpdate
from app.routes.deps import get_current_user

router = APIRouter(prefix="/user", tags=["User"])


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


@router.get("/profile")
def get_profile(
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "phone": user.phone,
        "name": user.name,
        "state": user.state,
        "district": user.district,
        "village": user.village,
        "land_size": user.land_size,
        "crops": user.crops,
        "language": user.language,
        "profile_complete": is_profile_complete(user),
    }



@router.put("/profile/update")
def update_profile(
    payload: UserProfileUpdate,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.name = payload.name
    user.state = payload.state
    user.district = payload.district
    user.village = payload.village
    user.land_size = payload.land_size
    user.crops = payload.crops
    user.language = payload.language

    db.commit()
    db.refresh(user)

    return {"message": "Profile updated"}
