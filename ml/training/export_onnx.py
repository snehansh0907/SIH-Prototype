"""
Pashu Sarthak - PyTorch to ONNX Export Utility (SIH26128)
Converts trained PyTorch model checkpoints (.pth) to standard optimized ONNX models (.onnx).
"""

import os
import argparse

try:
    import torch
    from train import build_model, NUM_CLASSES, IMAGE_SIZE
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

def export_checkpoint(pth_path: str, onnx_path: str, num_classes: int = NUM_CLASSES):
    if not TORCH_AVAILABLE:
        print("[Error] PyTorch is required to export .pth checkpoints to ONNX.")
        return
        
    if not os.path.exists(pth_path):
        print(f"[Error] Checkpoint not found at: {pth_path}")
        return

    print(f"[Export] Loading PyTorch checkpoint: {pth_path}")
    model = build_model(num_classes=num_classes)
    state_dict = torch.load(pth_path, map_location='cpu')
    model.load_state_dict(state_dict)
    model.eval()

    dummy_input = torch.randn(1, 3, IMAGE_SIZE, IMAGE_SIZE)
    os.makedirs(os.path.dirname(os.path.abspath(onnx_path)), exist_ok=True)
    
    torch.onnx.export(
        model,
        dummy_input,
        onnx_path,
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=['pixel_values'],
        output_names=['logits'],
        dynamic_axes={'pixel_values': {0: 'batch_size'}, 'logits': {0: 'batch_size'}}
    )
    print(f"[Export] Exported ONNX model successfully -> {onnx_path} ({os.path.getsize(onnx_path)/1e6:.2f} MB)")

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("--checkpoint", default="ml/models/crop_disease_mobilenetv2_best.pth")
    parser.add_argument("--output", default="ml/models/crop_disease_mobilenetv2.onnx")
    parser.add_argument("--classes", type=int, default=NUM_CLASSES)
    args = parser.parse_args()
    
    export_checkpoint(args.checkpoint, args.output, args.classes)
