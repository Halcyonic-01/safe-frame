import cv2
import numpy as np
from pyzbar.pyzbar import decode
import matplotlib.pyplot as plt

# -----------------------------
# 🔹 QR DETECTION (OpenCV)
# -----------------------------
def detect_qr_opencv(image):
    qr_detector = cv2.QRCodeDetector()

    retval, decoded_info, points, _ = qr_detector.detectAndDecodeMulti(image)

    boxes = []

    if retval:
        for pts in points:
            pts = pts.astype(int)

            x_min = min(pts[:, 0])
            y_min = min(pts[:, 1])
            x_max = max(pts[:, 0])
            y_max = max(pts[:, 1])

            boxes.append((x_min, y_min, x_max, y_max))

    return boxes


# -----------------------------
# 🔹 BARCODE + QR (pyzbar)
# -----------------------------
def detect_barcodes(image):
    detections = decode(image)

    boxes = []

    for d in detections:
        x, y, w, h = d.rect
        boxes.append((x, y, x+w, y+h))

    return boxes


# -----------------------------
# 🔹 MERGE BOXES
# -----------------------------
def get_all_codes(image):
    qr_boxes = detect_qr_opencv(image)
    barcode_boxes = detect_barcodes(image)

    return qr_boxes + barcode_boxes


# -----------------------------
# 🔹 BLUR FUNCTION
# -----------------------------
def blur_regions(image, boxes, debug=True):
    img = image.copy()

    for (x1, y1, x2, y2) in boxes:
        roi = img[y1:y2, x1:x2]

        if roi.size == 0:
            continue

        blur = cv2.GaussianBlur(roi, (51, 51), 0)
        img[y1:y2, x1:x2] = blur

        if debug:
            cv2.rectangle(img, (x1, y1), (x2, y2), (0,255,0), 2)
            cv2.putText(img, "CODE", (x1, y1-5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,255,0), 1)

    return img


# -----------------------------
# 🔹 DISPLAY
# -----------------------------
def show(original, processed):
    original = cv2.cvtColor(original, cv2.COLOR_BGR2RGB)
    processed = cv2.cvtColor(processed, cv2.COLOR_BGR2RGB)

    plt.figure(figsize=(12,6))

    plt.subplot(1,2,1)
    plt.title("Original")
    plt.imshow(original)
    plt.axis("off")

    plt.subplot(1,2,2)
    plt.title("QR / Barcode Blurred")
    plt.imshow(processed)
    plt.axis("off")

    plt.show()


# -----------------------------
# 🔹 MAIN PIPELINE
# -----------------------------
def process_codes(image_path):
    print("[INFO] Loading image...")
    image = cv2.imread(image_path)

    if image is None:
        print("[ERROR] Image not found")
        return

    print("[INFO] Detecting QR + Barcodes...")
    boxes = get_all_codes(image)

    print(f"[INFO] Found {len(boxes)} code(s)")

    print("[INFO] Applying blur...")
    result = blur_regions(image, boxes)

    print("[INFO] Displaying result...")
    show(image, result)


# -----------------------------
# 🔹 RUN
# -----------------------------
if __name__ == "__main__":
    process_codes("qr1.png")