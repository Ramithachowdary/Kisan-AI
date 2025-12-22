from fastapi import APIRouter, UploadFile, File
from app.models.diagnosis_ml import classify_disease
import os

router = APIRouter()

@router.post("/predict")
async def predict_disease(image: UploadFile = File(...)):
    # Save image temporarily to a known path
    save_dir = "static/uploads"  # Ensure this exists or create with os.makedirs
    os.makedirs(save_dir, exist_ok=True)
    image_path = os.path.join(save_dir, image.filename)
    with open(image_path, "wb") as f:
        f.write(await image.read())

    # Predict using loaded model
    result = classify_disease(image_path)

    # Optionally: Clean up by removing image file after prediction
    # os.remove(image_path)

    return {
        "predicted_disease": result["disease"],
        "confidence": result["confidence"]
    }
