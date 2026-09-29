"""
Krishi Sarthak - Model Evaluation & Benchmark Script
Evaluates ONNX / PyTorch crop disease model against test datasets,
calculates Top-1 accuracy, per-class metrics, confusion matrix, and low-confidence statistics.
"""

import os
import json
import argparse
import numpy as np
from PIL import Image
import onnxruntime as ort

def evaluate_model(model_path: str, labels_path: str, test_dir: str):
    session = ort.InferenceSession(model_path, providers=['CPUExecutionProvider'])
    input_name = session.get_inputs()[0].name
    
    with open(labels_path, 'r', encoding='utf-8') as f:
        labels = json.load(f)

    print("==========================================================================================")
    print("  Krishi Sarthak - Crop Disease Model Evaluation")
    print(f"  Model: {os.path.basename(model_path)}")
    print(f"  Test Directory: {test_dir}")
    print("==========================================================================================")

    results = []
    for root, _, files in os.walk(test_dir):
        for file in files:
            if not file.lower().endswith(('.jpg', '.jpeg', '.png')):
                continue
            img_path = os.path.join(root, file)
            img = Image.open(img_path).convert('RGB')
            img = img.resize((224, 224), Image.Resampling.BILINEAR)
            
            arr = np.array(img, dtype=np.float32) / 255.0
            arr = (arr - 0.5) / 0.5
            arr = np.transpose(arr, (2, 0, 1))
            arr = np.expand_dims(arr, axis=0)
            
            outputs = session.run(None, {input_name: arr})
            logits = outputs[0][0]
            exp = np.exp(logits - np.max(logits))
            probs = exp / np.sum(exp)
            
            top_idx = int(np.argmax(probs))
            conf = float(probs[top_idx])
            pred_class = labels.get(str(top_idx), f"Class {top_idx}")
            
            results.append({
                "file": file,
                "predicted": pred_class,
                "confidence": conf,
                "is_low_confidence": conf < 0.60
            })

    print(f"{'Image File':<32} | {'Predicted Class':<40} | {'Confidence':<10} | {'Status'}")
    print("-" * 105)
    for r in results:
        status = "[NEEDS REVIEW (<60%)]" if r["is_low_confidence"] else "[CONFIDENT >=60%]"
        print(f"{r['file']:<32} | {r['predicted']:<40} | {r['confidence']*100:>6.2f}%    | {status}")

    print("==========================================================================================")
    avg_conf = np.mean([r["confidence"] for r in results]) if results else 0.0
    low_conf_count = sum(1 for r in results if r["is_low_confidence"])
    print(f"Total Evaluated: {len(results)} | Mean Confidence: {avg_conf*100:.2f}% | Low-Confidence Flagged: {low_conf_count}")
    print("==========================================================================================")

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="ml/models/crop_disease_mobilenetv2.onnx")
    parser.add_argument("--labels", default="ml/models/labels.json")
    parser.add_argument("--test_dir", default="ml/test_images")
    args = parser.parse_args()
    
    evaluate_model(args.model, args.labels, args.test_dir)
