"""
OCR + Regex Sensitive Text Detection & Blur Pipeline
Uses EasyOCR + regex patterns to detect and blur PII.
Detects: Aadhaar, PAN, phone, email, bank details, IFSC, cards, etc.
"""

import cv2
import re
import easyocr

# Initialize OCR reader once at module level
reader = easyocr.Reader(['en'], gpu=False)

# Regex patterns for sensitive data
PATTERNS = {
    # High Precision
    "email": r"\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|in)\b",
    "pan": r"\b[A-Z]{5}[0-9]{4}[A-Z]\b",
    "ifsc": r"\b[A-Z]{4}0[A-Z0-9]{6}\b",
    "passport": r"\b[A-Z][0-9]{7}\b",

    # Medium Precision
    "phone": r"\b(?:\+91[\-\s]?)?[6-9]\d{9}\b",
    "aadhaar": r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b",
    "license_plate": r"\b[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}\b",
    "dob": r"\b(?:0[1-9]|[12][0-9]|3[01])[/-](?:0[1-9]|1[0-2])[/-](?:19|20)\d{2}\b",

    # Controlled
    "card": r"\b(?:\d{4}[-\s]){3}\d{4}\b",
    "bank_account": r"\b\d{12,18}\b",

    # Refined UPI
    "upi": r"\b[a-zA-Z0-9.\-_]{2,}@(okhdfcbank|okicici|oksbi|okaxis|upi|ybl|ibl|paytm)\b",

    # Optional
    "ip": r"\b(?:25[0-5]|2[0-4]\d|1\d\d|\d\d|\d)\.(?:25[0-5]|2[0-4]\d|1\d\d|\d\d|\d)\.(?:25[0-5]|2[0-4]\d|1\d\d|\d\d|\d)\.(?:25[0-5]|2[0-4]\d|1\d\d|\d\d|\d)\b",
}


def _is_sensitive(text):
    """Check if text matches any sensitive data pattern."""
    matches = []
    for label, pattern in PATTERNS.items():
        if re.search(pattern, text):
            matches.append(label)
    return matches


def process_image_array(image):
    """
    Detect sensitive text in an OpenCV image array and blur the regions.

    Args:
        image: OpenCV BGR image array (numpy ndarray)

    Returns:
        Modified OpenCV BGR image array with sensitive text blurred
    """
    image_copy = image.copy()

    results = reader.readtext(image_copy)

    for (bbox, text, prob) in results:
        text_clean = text.strip()
        labels = _is_sensitive(text_clean)

        if labels:
            x_coords = [int(point[0]) for point in bbox]
            y_coords = [int(point[1]) for point in bbox]

            x_min = max(0, min(x_coords))
            y_min = max(0, min(y_coords))
            x_max = min(image_copy.shape[1], max(x_coords))
            y_max = min(image_copy.shape[0], max(y_coords))

            roi = image_copy[y_min:y_max, x_min:x_max]

            if roi.size == 0:
                continue

            blur = cv2.GaussianBlur(roi, (51, 51), 0)
            image_copy[y_min:y_max, x_min:x_max] = blur

    return image_copy
