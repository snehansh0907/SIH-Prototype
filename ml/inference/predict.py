"""
Krishi Sarthak - ML Inference Engine (Python)
Performs real deep learning inference using the MobileNetV2 ONNX model.
"""

import os
import sys
import json
import time
from typing import Dict, Any, Optional
import numpy as np
import onnxruntime as ort

from preprocessor import preprocess_image

DEFAULT_MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'crop_disease_mobilenetv2.onnx')
DEFAULT_MAPPING_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'class_mapping.json')
CONFIDENCE_THRESHOLD = 0.60

class CropDiseaseClassifier:
    def __init__(self, model_path: Optional[str] = None, mapping_path: Optional[str] = None):
        self.model_path = model_path or DEFAULT_MODEL_PATH
        self.mapping_path = mapping_path or DEFAULT_MAPPING_PATH
        
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model file not found at {self.model_path}. Run scripts/download_model.py first.")
            
        # Load class mappings
        with open(self.mapping_path, 'r') as f:
            self.class_mapping = json.load(f)

        # Initialize ONNX session once in memory
        options = ort.SessionOptions()
        options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
        self.session = ort.InferenceSession(self.model_path, options, providers=['CPUExecutionProvider'])
        
        self.input_name = self.session.get_inputs()[0].name
        self.output_name = self.session.get_outputs()[0].name
        self.model_version = "1.0.0-mobilenetv2"

    def predict(self, image_input) -> Dict[str, Any]:
        start_time = time.perf_counter()
        
        # 1. Preprocess
        tensor = preprocess_image(image_input)
        
        # 2. Run inference
        outputs = self.session.run([self.output_name], {self.input_name: tensor})
        logits = outputs[0][0]
        
        # 3. Softmax
        exp_logits = np.exp(logits - np.max(logits))
        probabilities = exp_logits / np.sum(exp_logits)
        
        # 4. Top-1 and Top-3 predictions
        top_idx = int(np.argmax(probabilities))
        confidence = float(probabilities[top_idx])
        
        top3_indices = np.argsort(probabilities)[::-1][:3]
        top3 = [
            {
                "class_id": int(i),
                "name": self.class_mapping.get(str(i), {}).get("raw_name", f"Class {i}"),
                "probability": float(probabilities[i])
            }
            for i in top3_indices
        ]
        
        class_info = self.class_mapping.get(str(top_idx), {
            "crop": "Unknown",
            "disease": "Uncertain",
            "is_healthy": False,
            "scientific_name": "N/A"
        })
        
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        
        is_low_confidence = confidence < CONFIDENCE_THRESHOLD
        
        return {
            "crop": class_info["crop"],
            "disease": "Uncertain Image / Low AI Confidence" if is_low_confidence else class_info["disease"],
            "raw_class_name": class_info.get("raw_name", ""),
            "confidence": round(confidence, 4),
            "confidence_percent": round(confidence * 100, 1),
            "is_healthy": class_info.get("is_healthy", False),
            "scientific_name": class_info.get("scientific_name", "N/A"),
            "needs_expert_review": is_low_confidence or (not class_info.get("is_healthy", False) and confidence < 0.80),
            "is_low_confidence": is_low_confidence,
            "top3_predictions": top3,
            "ml_metadata": {
                "model": "MobileNetV2-PlantVillage",
                "version": self.model_version,
                "framework": "ONNX Runtime",
                "input_dimensions": [1, 3, 224, 224],
                "latency_ms": latency_ms,
                "real_inference": True
            }
        }

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python predict.py <path_to_image>")
        sys.exit(1)
        
    img_path = sys.argv[1]
    classifier = CropDiseaseClassifier()
    result = classifier.predict(img_path)
    print(json.dumps(result, indent=2))
