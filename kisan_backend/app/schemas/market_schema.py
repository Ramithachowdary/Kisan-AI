 
from pydantic import BaseModel
from typing import Optional

class MarketPriceRequest(BaseModel):
    crop: str
    mandi: str = None  # optional: if specific mandi (market) is needed

class ProductCreate(BaseModel):
    title: str
    category: str
    price: float
    unit: str = "/kg"
    location: str
    description: Optional[str] = None
    emoji: Optional[str] = None

class ProductResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    title: str
    category: str
    price: float
    unit: str
    location: str
    description: Optional[str] = None
    image: Optional[str] = None
    emoji: Optional[str] = None

    class Config:
        from_attributes = True

