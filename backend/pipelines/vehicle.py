"""
Vehicle Number Plate Detection & Blur Pipeline
Uses YOLOv8 to detect license plates and blur them.
"""

import os
import cv2
from ultralytics import YOLO

# Load YOLO model once at module level
# The model weights file should be in the backend directory
_MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "best.pt")
model = YOLO(_MODEL_PATH)


def process_image_array(image):
    """
    Detect vehicle number plates in an OpenCV image array and blur them.

    Args:
        image: OpenCV BGR image array (numpy ndarray)

    Returns:
        Modified OpenCV BGR image array with plates blurred
    """
    image_copy = image.copy()

    results = model(image_copy, verbose=False)

    for r in results:
        boxes = r.boxes.xyxy.cpu().numpy()

        for box in boxes:
            x1, y1, x2, y2 = map(int, box[:4])

            # Safety clamp
            x1 = max(0, x1)
            y1 = max(0, y1)
            x2 = min(image_copy.shape[1], x2)
            y2 = min(image_copy.shape[0], y2)

            roi = image_copy[y1:y2, x1:x2]

            if roi.size == 0:
                continue

            blur = cv2.GaussianBlur(roi, (71, 71), 30)
            image_copy[y1:y2, x1:x2] = blur

    return image_copy
