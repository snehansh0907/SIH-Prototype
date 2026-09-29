import os
import sys
import numpy as np
from PIL import Image
import onnxruntime as ort

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

RELEVANCE_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'crop_relevance_mobilenetv2.onnx')
DISEASE_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'crop_disease_mobilenetv2.onnx')

def preprocess_image(path):
    img = Image.open(path).convert('RGB').resize((224, 224))
    arr = np.array(img, dtype=np.float32) / 255.0
    arr = (arr - 0.5) / 0.5
    # HWC -> CHW -> NCHW
    tensor = np.transpose(arr, (2, 0, 1))
    return np.expand_dims(tensor, axis=0)

def softmax(x):
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum(axis=-1)

def run_tests():
    rel_session = ort.InferenceSession(RELEVANCE_MODEL_PATH)
    
    neg_dir = os.path.join(os.path.dirname(__file__), 'test_images', 'negatives')
    pos_dir = os.path.join(os.path.dirname(__file__), 'test_images')

    print("==================================================")
    print("STAGE 1 CROP RELEVANCE GATE BENCHMARK")
    print("==================================================")

    # 1. Test Negatives (Should be classified as 0: Non-Crop, P(Crop) < 0.50)
    print("\n[TEST SET: NON-CROP NEGATIVES]")
    neg_files = [f for f in os.listdir(neg_dir) if f.lower().endswith(('.jpg', '.png', '.jpeg'))]
    correct_neg = 0
    for f in neg_files:
        path = os.path.join(neg_dir, f)
        tensor = preprocess_image(path)
        outputs = rel_session.run(None, {'pixel_values': tensor})
        logits = outputs[0][0]
        probs = softmax(logits)
        crop_prob = probs[1]
        passed = (crop_prob < 0.55)
        if passed:
            correct_neg += 1
        print(f"  Negative: {f:<26} -> P(Crop): {crop_prob*100:5.1f}% | Stage 1 Decision: {'REJECT (PASS)' if passed else 'FAIL (False Accept)'}")

    # 2. Test Positives (Should be classified as 1: Crop, P(Crop) >= 0.55)
    print("\n[TEST SET: CROP LEAF POSITIVES]")
    pos_files = [f for f in os.listdir(pos_dir) if f.startswith(('Tomato', 'Soybean')) and f.lower().endswith(('.jpg', '.png', '.jpeg'))]
    correct_pos = 0
    for f in pos_files:
        path = os.path.join(pos_dir, f)
        tensor = preprocess_image(path)
        outputs = rel_session.run(None, {'pixel_values': tensor})
        logits = outputs[0][0]
        probs = softmax(logits)
        crop_prob = probs[1]
        passed = (crop_prob >= 0.55)
        if passed:
            correct_pos += 1
        print(f"  Positive: {f:<26} -> P(Crop): {crop_prob*100:5.1f}% | Stage 1 Decision: {'ACCEPT (PASS)' if passed else 'FAIL (False Reject)'}")

    print("\n==================================================")
    print(f"Non-Crop Negative Rejection Rate: {correct_neg}/{len(neg_files)} ({correct_neg/len(neg_files)*100:.1f}%)")
    print(f"Crop Positive Acceptance Rate:   {correct_pos}/{len(pos_files)} ({correct_pos/len(pos_files)*100:.1f}%)")
    print("==================================================")

if __name__ == '__main__':
    run_tests()
