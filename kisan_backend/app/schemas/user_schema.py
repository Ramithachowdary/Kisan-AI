from pydantic import BaseModel, Field, validator
from typing import Optional, List

class UserProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    state: Optional[str]
    district: Optional[str]
    village: Optional[str]
    land_size: Optional[float]
    crops: Optional[str]
    language: Optional[str]

    @validator("land_size")
    def validate_land_size(cls, v):
        if v is not None and v < 0:
            raise ValueError("Land size must be positive")
        return v
