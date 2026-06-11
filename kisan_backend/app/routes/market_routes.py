 
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.database import SessionLocal
from app.models.models import MarketPrice, Product
from app.schemas.market_schema import MarketPriceRequest, ProductCreate, ProductResponse
from app.routes.deps import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

DEFAULT_PRODUCTS = [
    {
        "id": -1,
        "title": "Carrot",
        "category": "Vegetables",
        "price": 12.0,
        "unit": "/kg",
        "location": "Chennai",
        "description": "Fresh",
        "image": None,
        "emoji": "🥕",
    },
    {
        "id": -2,
        "title": "Apple",
        "category": "Fruits",
        "price": 100.0,
        "unit": "/kg",
        "location": "Chennai",
        "description": "Very fresh and tasty",
        "image": None,
        "emoji": "🍎",
    },
    {
        "id": -3,
        "title": "Organic Alphonso Mangoes",
        "category": "Fruits",
        "price": 450.0,
        "unit": "/dozen",
        "location": "Ratnagiri, Maharashtra",
        "description": "Naturally ripened, sweet and juicy Alphonso mangoes direct from Ratnagiri farms. Selected grade-A quality fruit.",
        "image": "/images/mangoes.png",
        "emoji": "🥭",
    },
    {
        "id": -4,
        "title": "Fresh Farm Red Tomatoes",
        "category": "Vegetables",
        "price": 40.0,
        "unit": "/kg",
        "location": "Nashik, Maharashtra",
        "description": "Vibrant red, pesticide-free, freshly harvested tomatoes. Rich in taste, perfect for kitchen cooking and salads.",
        "image": "/images/tomatoes.png",
        "emoji": "🍅",
    },
    {
        "id": -5,
        "title": "Premium Basmati Rice",
        "category": "Grains",
        "price": 110.0,
        "unit": "/kg",
        "location": "Karnal, Haryana",
        "description": "Aromatic long-grain traditional Basmati rice. Aged for 12 months for premium taste and fluffiness.",
        "image": "/images/rice.png",
        "emoji": "🍚",
    },
    {
        "id": -6,
        "title": "Fresh Green Spiced Chillies",
        "category": "Vegetables",
        "price": 60.0,
        "unit": "/kg",
        "location": "Guntur, Andhra Pradesh",
        "description": "Spicy and fresh green chillies directly picked from farms. Perfect for daily spice requirements.",
        "image": "/images/chillies.png",
        "emoji": "🌶️",
    },
    {
        "id": -7,
        "title": "Organic Green Cardamom (Elaichi)",
        "category": "Spices",
        "price": 1800.0,
        "unit": "/kg",
        "location": "Idukki, Kerala",
        "description": "Highly aromatic, bold green cardamom pods harvested from the hills of Idukki. Hand-sorted and premium grade.",
        "image": "/images/cardamom.png",
        "emoji": "🟢",
    },
    {
        "id": -8,
        "title": "Fresh Milk",
        "category": "Dairy",
        "price": 50.0,
        "unit": "/liter",
        "location": "Tamil Nadu",
        "description": "Pure and fresh milk from healthy cows. Delivered daily.",
        "image": None,
        "emoji": "🥛",
    },
    {
        "id": -9,
        "title": "Onion",
        "category": "Vegetables",
        "price": 12.0,
        "unit": "/kg",
        "location": "Tamil Nadu",
        "description": "Fresh",
        "image": None,
        "emoji": "🧅",
    },
    {
        "id": -10,
        "title": "Potato",
        "category": "Vegetables",
        "price": 25.0,
        "unit": "/kg",
        "location": "Punjab",
        "description": "Fresh and quality potatoes",
        "image": None,
        "emoji": "🥔",
    },
    {
        "id": -11,
        "title": "Honey",
        "category": "Other",
        "price": 400.0,
        "unit": "/kg",
        "location": "Himachal Pradesh",
        "description": "Pure organic honey from beehives",
        "image": None,
        "emoji": "🍯",
    },
    {
        "id": -12,
        "title": "Sugarcane Juice",
        "category": "Other",
        "price": 5.0,
        "unit": "/glass",
        "location": "Maharashtra",
        "description": "Fresh sugarcane juice",
        "image": None,
        "emoji": "🥤",
    }
]

CATEGORY_EMOJIS = {
    "fruits": "🍎",
    "vegetables": "🥕",
    "grains": "🌾",
    "dairy": "🥛",
    "spices": "🌶️",
    "other": "📦"
}

@router.post("/market")
def get_market_price(req: MarketPriceRequest, db: Session = Depends(get_db)):
    query = db.query(MarketPrice).filter(MarketPrice.crop.ilike(req.crop))
    if req.mandi:
        query = query.filter(MarketPrice.mandi.ilike(req.mandi))
    prices = query.all()
    result = [
        {"mandi": p.mandi, "price": p.price, "trend": p.trend}
        for p in prices
    ]
    return {"prices": result}

@router.get("/market/products")
def get_products(db: Session = Depends(get_db)):
    db_products = db.query(Product).order_by(Product.created_at.desc()).all()
    
    # Map SQLAlchemy models to dict
    mapped_db_products = []
    for p in db_products:
        mapped_db_products.append({
            "id": p.id,
            "user_id": p.user_id,
            "title": p.title,
            "category": p.category,
            "price": p.price,
            "unit": p.unit,
            "location": p.location,
            "description": p.description,
            "image": p.image,
            "emoji": p.emoji
        })
    
    # Return user products combined with default fallback items
    return mapped_db_products + DEFAULT_PRODUCTS

@router.post("/market/products")
def create_product(
    payload: ProductCreate,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    emoji = payload.emoji
    if not emoji:
        # Resolve standard emoji based on category
        emoji = CATEGORY_EMOJIS.get(payload.category.lower(), "📦")
        
    db_product = Product(
        user_id=user_id,
        title=payload.title,
        category=payload.category,
        price=payload.price,
        unit=payload.unit,
        location=payload.location,
        description=payload.description,
        emoji=emoji
    )
    
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    return {
        "id": db_product.id,
        "user_id": db_product.user_id,
        "title": db_product.title,
        "category": db_product.category,
        "price": db_product.price,
        "unit": db_product.unit,
        "location": db_product.location,
        "description": db_product.description,
        "emoji": db_product.emoji
    }

@router.delete("/market/products/{product_id}")
def delete_product(
    product_id: int,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this product")
    
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}


