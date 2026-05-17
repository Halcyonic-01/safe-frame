import cv2
import numpy as np
import easyocr
import re
import matplotlib.pyplot as plt

# -----------------------------
# 🔹 INIT OCR
# -----------------------------
reader = easyocr.Reader(['en'])

# -----------------------------
# 🔹 REGEX PATTERNS (EXTENDED)
# -----------------------------
PATTERNS = {
    # -----------------------------
    # 🔴 HIGH PRECISION (STRICT)
    # -----------------------------

    "email": r"\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|in)\b",

    "pan": r"\b[A-Z]{5}[0-9]{4}[A-Z]\b",

    "ifsc": r"\b[A-Z]{4}0[A-Z0-9]{6}\b",

    "passport": r"\b[A-Z][0-9]{7}\b",

    # -----------------------------
    # 🟠 MEDIUM PRECISION
    # -----------------------------

    "phone": r"\b(?:\+91[\-\s]?)?[6-9]\d{9}\b",

    "aadhaar": r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b",

    "license_plate": r"\b[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}\b",

    "dob": r"\b(?:0[1-9]|[12][0-9]|3[01])[/-](?:0[1-9]|1[0-2])[/-](?:19|20)\d{2}\b",

    # -----------------------------
    # 🟡 CONTROLLED (STRICT FORMAT)
    # -----------------------------

    # Credit/Debit Card (must be grouped)
    "card": r"\b(?:\d{4}[-\s]){3}\d{4}\b",

    # Bank account (only if long continuous digits)
    "bank_account": r"\b\d{12,18}\b",

    # -----------------------------
    # 🟢 VERY CAREFUL (REFINED UPI)
    # -----------------------------

    # UPI (only known handles)
    "upi": r"\b[a-zA-Z0-9.\-_]{2,}@(okhdfcbank|okicici|oksbi|okaxis|upi|ybl|ibl|paytm)\b",

    # -----------------------------
    # 🔵 OPTIONAL (LOW PRIORITY)
    # -----------------------------

    "ip": r"\b(?:25[0-5]|2[0-4]\d|1\d\d|\d\d|\d)\.(?:25[0-5]|2[0-4]\d|1\d\d|\d\d|\d)\.(?:25[0-5]|2[0-4]\d|1\d\d|\d\d|\d)\.(?:25[0-5]|2[0-4]\d|1\d\d|\d\d|\d)\b"
}

# -----------------------------
# 🔹 CHECK SENSITIVE TEXT
# -----------------------------
def is_sensitive(text):
    matches = []
    for label, pattern in PATTERNS.items():
        if re.search(pattern, text):
            matches.append(label)
    return matches


# -----------------------------
# 🔹 OCR DETECTION
# -----------------------------
def detect_sensitive_text(image):
    results = reader.readtext(image)
    
    sensitive_boxes = []

    for (bbox, text, prob) in results:
        text_clean = text.strip()
        labels = is_sensitive(text_clean)

        if labels:
            sensitive_boxes.append({
                "bbox": bbox,
                "text": text_clean,
                "labels": labels,
                "confidence": prob
            })

    return sensitive_boxes


# -----------------------------
# 🔹 BLUR FUNCTION
# -----------------------------
def blur_regions(image, detections, debug=False):
    image_copy = image.copy()

    for det in detections:
        bbox = det["bbox"]

        x_coords = [int(point[0]) for point in bbox]
        y_coords = [int(point[1]) for point in bbox]

        x_min, x_max = min(x_coords), max(x_coords)
        y_min, y_max = min(y_coords), max(y_coords)

        x_min = max(0, x_min)
        y_min = max(0, y_min)
        x_max = min(image_copy.shape[1], x_max)
        y_max = min(image_copy.shape[0], y_max)

        roi = image_copy[y_min:y_max, x_min:x_max]

        if roi.size == 0:
            continue

        blur = cv2.GaussianBlur(roi, (51, 51), 0)
        image_copy[y_min:y_max, x_min:x_max] = blur

        if debug:
            cv2.rectangle(image_copy, (x_min, y_min), (x_max, y_max), (0,255,0), 2)
            label_text = ",".join(det["labels"])
            cv2.putText(image_copy, label_text, (x_min, y_min-5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,255,0), 1)

    return image_copy


# -----------------------------
# 🔹 DISPLAY FUNCTION
# -----------------------------
def show_results(original, processed):
    # Convert BGR → RGB for matplotlib
    original_rgb = cv2.cvtColor(original, cv2.COLOR_BGR2RGB)
    processed_rgb = cv2.cvtColor(processed, cv2.COLOR_BGR2RGB)

    plt.figure(figsize=(12, 6))

    plt.subplot(1, 2, 1)
    plt.title("Original Image")
    plt.imshow(original_rgb)
    plt.axis("off")

    plt.subplot(1, 2, 2)
    plt.title("Redacted Image")
    plt.imshow(processed_rgb)
    plt.axis("off")

    plt.tight_layout()
    plt.show()


# -----------------------------
# 🔹 MAIN PIPELINE
# -----------------------------
def process_image(input_path, debug=True):
    print(f"[INFO] Loading image: {input_path}")
    image = cv2.imread(input_path)

    if image is None:
        print("[ERROR] Could not read image.")
        return

    print("[INFO] Running OCR...")
    detections = detect_sensitive_text(image)

    print(f"[INFO] Found {len(detections)} sensitive items\n")

    for det in detections:
        print(f"TEXT: {det['text']}")
        print(f"TYPE: {det['labels']}")
        print(f"CONF: {det['confidence']:.2f}")
        print("-"*40)

    print("[INFO] Applying blur...")
    result = blur_regions(image, detections, debug=debug)

    print("[INFO] Displaying result...")
    show_results(image, result)


# -----------------------------
# 🔹 RUN
# -----------------------------
if __name__ == "__main__":
    process_image("t1.jpg", debug=True)