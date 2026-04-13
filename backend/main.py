from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from PIL import Image
import io
import os
import json
from tensorflow.keras.models import model_from_json

app = FastAPI(title="Brain Tumor Classification API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_DIR = os.path.join(os.path.dirname(__file__), "modelo_ia")
JSON_PATH = os.path.join(MODEL_DIR, "braintumor_xception.json")
WEIGHTS_PATH = os.path.join(MODEL_DIR, "braintumor_xception.weights.h5")

CLASES_TUMOR = {
    0: "Glioma",
    1: "Meningioma",
    2: "No Tumor",
    3: "Pituitary"
}

model = None

def remove_unsupported_kwargs(config):
    if isinstance(config, dict):
        if "quantization_config" in config:
            del config["quantization_config"]
        for key, value in config.items():
            remove_unsupported_kwargs(value)
    elif isinstance(config, list):
        for item in config:
            remove_unsupported_kwargs(item)

@app.on_event("startup")
async def load_model():
    global model
    try:
        if not os.path.exists(JSON_PATH) or not os.path.exists(WEIGHTS_PATH):
            print(f"Error: Model files not found in {MODEL_DIR}")
            return
        
        with open(JSON_PATH, "r") as json_file:
            model_data = json.load(json_file)
            
        remove_unsupported_kwargs(model_data)
        model_json = json.dumps(model_data)
            
        model = model_from_json(model_json)
        model.load_weights(WEIGHTS_PATH)
        print("Model architecture and weights loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    global model
    if model is None:
        raise HTTPException(status_code=500, detail="Model is not initialized.")
        
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File uploaded is not an image.")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # --- PREPROCESAMIENTO ESTRICTO ---
        # 1. Redimensionar la imagen a (299, 299).
        image = image.resize((299, 299))
        
        # 2. Convertir a array de NumPy.
        img_array = np.array(image)
        
        # 3. Expandir dimensiones (axis=0).
        img_array = np.expand_dims(img_array, axis=0)
        
        # 4. Normalizar dividiendo entre 255.0.
        img_array = img_array / 255.0
        
        # --- PREDICCIÓN ---
        predictions = model.predict(img_array)[0] # Extract the probabilities array
        
        predicted_class_idx = int(np.argmax(predictions))
        predicted_class_name = CLASES_TUMOR.get(predicted_class_idx, "Unknown")
        
        probabilities = {CLASES_TUMOR[i]: float(predictions[i]) for i in range(len(predictions))}
        
        return {
            "prediction": predicted_class_name,
            "confidence": float(predictions[predicted_class_idx]),
            "probabilities": probabilities
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error in processing image: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
