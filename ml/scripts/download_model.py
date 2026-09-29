"""
Krishi Sarthak - Model Download Script
Downloads the pre-trained MobileNetV2 ONNX model weights and class labels from the official repository.
"""

import os
import json
import urllib.request

MODEL_URL = 'https://huggingface.co/onnx-community/mobilenet_v2_1.0_224-plant-disease-identification-ONNX/resolve/main/onnx/model.onnx'
CONFIG_URL = 'https://huggingface.co/onnx-community/mobilenet_v2_1.0_224-plant-disease-identification-ONNX/raw/main/config.json'

def download_model(target_dir: str = 'ml/models'):
    os.makedirs(target_dir, exist_ok=True)
    model_path = os.path.join(target_dir, 'crop_disease_mobilenetv2.onnx')
    labels_path = os.path.join(target_dir, 'labels.json')

    if not os.path.exists(model_path):
        print(f"[Download] Fetching MobileNetV2 ONNX model (8.8 MB) -> {model_path} ...")
        urllib.request.urlretrieve(MODEL_URL, model_path)
        print("[Download] Model downloaded successfully.")
    else:
        print(f"[Check] Model already exists at: {model_path} ({os.path.getsize(model_path)/1e6:.2f} MB)")

    if not os.path.exists(labels_path):
        print(f"[Download] Fetching class labels -> {labels_path} ...")
        cfg_data = json.loads(urllib.request.urlopen(CONFIG_URL).read().decode())
        labels = cfg_data.get('id2label', {})
        with open(labels_path, 'w', encoding='utf-8') as f:
            json.dump(labels, f, indent=2)
        print(f"[Download] Saved {len(labels)} class labels.")
    else:
        print(f"[Check] Labels file exists at: {labels_path}")

if __name__ == '__main__':
    download_model()
