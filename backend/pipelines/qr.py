"""
QR Code & Barcode Detection & Blur Pipeline
Uses OpenCV QRCodeDetector + pyzbar to detect and blur codes.
"""

import os
import platform
import ctypes

# Fix pyzbar not finding zbar shared library on macOS (Homebrew).
# pyzbar uses ctypes.util.find_library("zbar") which doesn't search
# Homebrew paths. We monkey-patch its loader before importing pyzbar.
if platform.system() == "Darwin":
    _zbar_paths = [
        "/opt/homebrew/lib/libzbar.dylib",      # Apple Silicon
        "/usr/local/lib/libzbar.dylib",          # Intel Mac
    ]
    for _zbar_path in _zbar_paths:
        if os.path.exists(_zbar_path):
            import pyzbar.zbar_library as _zbar_lib
            _original_load = _zbar_lib.load
            def _patched_load(_p=_zbar_path):
                libzbar = ctypes.cdll.LoadLibrary(_p)
                return libzbar, []
            _zbar_lib.load = _patched_load
            break

import cv2
import numpy as np
from pyzbar.pyzbar import decode


def _detect_qr_opencv(image):
    """Detect QR codes using OpenCV's built-in detector."""
    qr_detector = cv2.QRCodeDetector()
    retval, decoded_info, points, _ = qr_detector.detectAndDecodeMulti(image)

    boxes = []
    if retval and points is not None:
        for pts in points:
            pts = pts.astype(int)
            x_min = min(pts[:, 0])
            y_min = min(pts[:, 1])
            x_max = max(pts[:, 0])
            y_max = max(pts[:, 1])
            boxes.append((x_min, y_min, x_max, y_max))

    return boxes


def _detect_barcodes(image):
    """Detect barcodes and QR codes using pyzbar."""
    detections = decode(image)

    boxes = []
    for d in detections:
        x, y, w, h = d.rect
        boxes.append((x, y, x + w, y + h))

    return boxes


def process_image_array(image):
    """
    Detect QR codes and barcodes in an OpenCV image array and blur them.

    Args:
        image: OpenCV BGR image array (numpy ndarray)

    Returns:
        Modified OpenCV BGR image array with codes blurred
    """
    image_copy = image.copy()

    # Merge detections from both methods
    qr_boxes = _detect_qr_opencv(image_copy)
    barcode_boxes = _detect_barcodes(image_copy)
    all_boxes = qr_boxes + barcode_boxes

    for (x1, y1, x2, y2) in all_boxes:
        # Safety clamp
        x1 = max(0, x1)
        y1 = max(0, y1)
        x2 = min(image_copy.shape[1], x2)
        y2 = min(image_copy.shape[0], y2)

        roi = image_copy[y1:y2, x1:x2]

        if roi.size == 0:
            continue

        blur = cv2.GaussianBlur(roi, (51, 51), 0)
        image_copy[y1:y2, x1:x2] = blur

    return image_copy
