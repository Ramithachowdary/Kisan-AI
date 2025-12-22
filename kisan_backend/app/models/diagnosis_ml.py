import tensorflow as tf
from PIL import Image
import numpy as np
import os

# Load model ONCE at module 
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # adjust if needed
MODEL_PATH = os.path.join(BASE_DIR, "models", "Model_Cnn.h5")

# or, if your structure is app/models/Model_Cnn.h5 and code is in app/
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "Model_Cnn.h5")

model = tf.keras.models.load_model(MODEL_PATH)

# Get class names (match order that Keras used during training)
CLASS_NAMES = ['Pepper_bact_spot', 'Pepper_healthy', 'Potato_early_blight', 'Potato_healthy']
# Or load dynamically:
# CLASS_NAMES = list(train_generator.class_indices.keys()) — but hardcoded here for backend.

def preprocess_image(image_path):
    img = Image.open(image_path).convert("RGB")
    img = img.resize((224, 224))
    img_array = np.array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)  # shape: (1,224,224,3)
    return img_array

def classify_disease(image_path):
    img_array = preprocess_image(image_path)
    pred = model.predict(img_array)
    class_idx = np.argmax(pred)
    disease = CLASS_NAMES[class_idx]
    confidence = float(np.max(pred))  # Optionally return confidence score
    return {"disease": disease, "confidence": confidence}
