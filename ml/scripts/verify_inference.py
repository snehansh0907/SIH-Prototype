"""
Krishi Sarthak - End-to-End Inference Verification Script
Tests the ML pipeline on authentic crop images across healthy, diseased, and out-of-distribution inputs.
"""

import os
import sys
import json

# Add parent directory to path so inference module is resolvable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'inference'))
from predict import CropDiseaseClassifier

def run_verification():
    classifier = CropDiseaseClassifier()
    test_dir = os.path.join(os.path.dirname(__file__), '..', 'test_images')
    
    test_cases = [
        {"filename": "Tomato___healthy.jpg", "expected_type": "Healthy Leaf", "description": "Healthy Tomato Leaf"},
        {"filename": "Tomato___Late_blight.jpg", "expected_type": "Late Blight", "description": "Tomato Late Blight Disease"},
        {"filename": "Tomato___Leaf_Mold.jpg", "expected_type": "Leaf Mold", "description": "Tomato Leaf Mold Disease"},
        {"filename": "Tomato___Early_blight.jpg", "expected_type": "Early Blight / Low Conf", "description": "Early Blight / Ambiguous"},
        {"filename": "non_leaf_random.jpg", "expected_type": "Low Confidence", "description": "Out-of-Distribution Image"}
    ]
    
    print("==========================================================================================")
    print("  Krishi Sarthak - ML Inference Verification Benchmark")
    print(f"  Model: MobileNetV2-PlantVillage | Framework: ONNX Runtime | Classes: 38")
    print("==========================================================================================")
    print(f"{'Input Test Image':<28} | {'Predicted Crop/Disease':<32} | {'Confidence':<10} | {'Latency':<9} | {'Review'}")
    print("-" * 105)
    
    for case in test_cases:
        img_path = os.path.join(test_dir, case["filename"])
        if not os.path.exists(img_path):
            print(f"Skipping {case['filename']} (not found)")
            continue
            
        res = classifier.predict(img_path)
        crop = res["crop"]
        disease = res["disease"]
        conf_str = f"{res['confidence_percent']}%"
        lat_str = f"{res['ml_metadata']['latency_ms']}ms"
        needs_review = "YES" if res["needs_expert_review"] else "NO"
        
        display_name = f"{crop}: {disease}" if disease != "Uncertain Image / Low AI Confidence" else "Uncertain / Low Conf"
        print(f"{case['filename']:<28} | {display_name:<32} | {conf_str:<10} | {lat_str:<9} | {needs_review}")

    print("==========================================================================================")

if __name__ == '__main__':
    run_verification()
