"""
Pashu Sarthak - ML Image Preprocessor (SIH26128)
Preprocesses animal/livestock symptom images for MobileNetV2 ONNX inference.
Input: JPEG, PNG, WEBP image file or byte stream.
Output: Normalized float32 numpy tensor of shape (1, 3, 224, 224) in NCHW format.
"""

import io
from typing import Union
import numpy as np
from PIL import Image

TARGET_SIZE = (224, 224)
IMAGE_MEAN = np.array([0.5, 0.5, 0.5], dtype=np.float32)
IMAGE_STD = np.array([0.5, 0.5, 0.5], dtype=np.float32)

def preprocess_image(image_input: Union[str, bytes, io.BytesIO, Image.Image]) -> np.ndarray:
    """
    Decodes, converts to RGB, resizes to 224x224, and normalizes input image.
    
    Returns:
        np.ndarray: float32 tensor of shape (1, 3, 224, 224)
    """
    if isinstance(image_input, str):
        img = Image.open(image_input)
    elif isinstance(image_input, bytes):
        img = Image.open(io.BytesIO(image_input))
    elif isinstance(image_input, io.BytesIO):
        img = Image.open(image_input)
    elif isinstance(image_input, Image.Image):
        img = image_input
    else:
        raise ValueError(f"Unsupported image input type: {type(image_input)}")

    # Ensure 3-channel RGB (handle RGBA, Grayscale, CMYK, Palette)
    if img.mode != 'RGB':
        img = img.convert('RGB')

    # Resize with Bilinear interpolation
    img = img.resize(TARGET_SIZE, Image.Resampling.BILINEAR)

    # Convert to float32 array in range [0.0, 1.0]
    img_arr = np.array(img, dtype=np.float32) / 255.0

    # Apply mean/std normalization: (x - 0.5) / 0.5
    img_arr = (img_arr - IMAGE_MEAN) / IMAGE_STD

    # Convert HWC (224, 224, 3) to CHW (3, 224, 224)
    img_arr = np.transpose(img_arr, (2, 0, 1))

    # Add batch dimension: (1, 3, 224, 224)
    tensor = np.expand_dims(img_arr, axis=0)
    return tensor
