import cv2
from ultralytics import YOLO

# -----------------------------
# LOAD YOLO LICENSE PLATE MODEL
# -----------------------------
model = YOLO("best.pt")

# -----------------------------
# INPUT / OUTPUT PATHS
# -----------------------------
INPUT_IMAGE = "car.jpg"
OUTPUT_IMAGE = "blurred_output.jpg"

# -----------------------------
# LOAD IMAGE
# -----------------------------
image = cv2.imread(INPUT_IMAGE)

if image is None:
    print("[ERROR] Could not load image")
    exit()

print("[INFO] Running license plate detection...")

# -----------------------------
# RUN YOLO INFERENCE
# -----------------------------
results = model(image)

total_detected = 0

# -----------------------------
# DETECT + BLUR PLATES
# -----------------------------
for r in results:

    boxes = r.boxes.xyxy.cpu().numpy()

    for box in boxes:

        total_detected += 1

        x1, y1, x2, y2 = map(int, box[:4])

        # Safety clamp
        x1 = max(0, x1)
        y1 = max(0, y1)
        x2 = min(image.shape[1], x2)
        y2 = min(image.shape[0], y2)

        roi = image[y1:y2, x1:x2]

        if roi.size == 0:
            continue

        # Strong Gaussian Blur
        blur = cv2.GaussianBlur(roi, (71, 71), 30)

        image[y1:y2, x1:x2] = blur

        # Optional debug rectangle
        cv2.rectangle(image, (x1, y1), (x2, y2), (0,255,0), 2)
        cv2.putText(
            image,
            "Plate",
            (x1, y1 - 5),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (0,255,0),
            1
        )

# -----------------------------
# SAVE OUTPUT
# -----------------------------
cv2.imwrite(OUTPUT_IMAGE, image)

print(f"[SUCCESS] Detected {total_detected} plate(s)")
print(f"[SUCCESS] Saved blurred image -> {OUTPUT_IMAGE}")