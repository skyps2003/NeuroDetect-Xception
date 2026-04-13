import os
import json
from tensorflow.keras.models import model_from_json

MODEL_DIR = os.path.join(os.path.dirname(__file__), "modelo_ia")
JSON_PATH = os.path.join(MODEL_DIR, "braintumor_xception.json")
WEIGHTS_PATH = os.path.join(MODEL_DIR, "braintumor_xception.weights.h5")

def remove_unsupported_kwargs(config):
    if isinstance(config, dict):
        if "quantization_config" in config:
            del config["quantization_config"]
        for key, value in config.items():
            remove_unsupported_kwargs(value)
    elif isinstance(config, list):
        for item in config:
            remove_unsupported_kwargs(item)

try:
    print(f"Checking if json exists: {os.path.exists(JSON_PATH)}")
    print(f"Checking if weights exist: {os.path.exists(WEIGHTS_PATH)}")
    
    with open(JSON_PATH, "r") as json_file:
        model_data = json.load(json_file)
        
    remove_unsupported_kwargs(model_data)
    model_json = json.dumps(model_data)
        
    print("Loading model from json...")
    model = model_from_json(model_json)
    
    print("Loading weights...")
    model.load_weights(WEIGHTS_PATH)
    print("Success!")
except Exception as e:
    import traceback
    traceback.print_exc()
