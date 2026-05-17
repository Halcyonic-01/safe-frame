import cv2
import matplotlib.pyplot as plt

# -----------------------------
# 🔹 LOAD FACE DETECTOR
# -----------------------------
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)

# -----------------------------
# 🔹 FACE DETECTION
# -----------------------------
def detect_faces(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30)
    )

    return faces


# -----------------------------
# 🔹 BLUR FACES
# -----------------------------
def blur_faces(image, faces, debug=True):
    image_copy = image.copy()

    for (x, y, w, h) in faces:
        roi = image_copy[y:y+h, x:x+w]

        if roi.size == 0:
            continue

        # Strong blur
        blur = cv2.GaussianBlur(roi, (99, 99), 30)
        image_copy[y:y+h, x:x+w] = blur

        if debug:
            cv2.rectangle(image_copy, (x, y), (x+w, y+h), (0,255,0), 2)
            cv2.putText(image_copy, "Face", (x, y-5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,255,0), 1)

    return image_copy


# -----------------------------
# 🔹 DISPLAY FUNCTION
# -----------------------------
def show_results(original, processed):
    original_rgb = cv2.cvtColor(original, cv2.COLOR_BGR2RGB)
    processed_rgb = cv2.cvtColor(processed, cv2.COLOR_BGR2RGB)

    plt.figure(figsize=(12,6))

    plt.subplot(1,2,1)
    plt.title("Original Image")
    plt.imshow(original_rgb)
    plt.axis("off")

    plt.subplot(1,2,2)
    plt.title("Face Blurred Image")
    plt.imshow(processed_rgb)
    plt.axis("off")

    plt.tight_layout()
    plt.show()


# -----------------------------
# 🔹 MAIN PIPELINE
# -----------------------------
def process_face_blur(image_path, debug=True):
    print(f"[INFO] Loading image: {image_path}")
    image = cv2.imread(image_path)

    if image is None:
        print("[ERROR] Could not read image.")
        return

    print("[INFO] Detecting faces...")
    faces = detect_faces(image)

    print(f"[INFO] Found {len(faces)} face(s)")

    print("[INFO] Applying blur...")
    result = blur_faces(image, faces, debug=debug)

    print("[INFO] Displaying result...")
    show_results(image, result)


# -----------------------------
# 🔹 RUN
# -----------------------------
if __name__ == "__main__":
    process_face_blur("face1.jpg")