"""
Face Detection & Blur Pipeline
Uses OpenCV Haar Cascade to detect and blur human faces.
"""

import cv2

# Load face detector once at module level
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
)


def process_image_array(image):
    """
    Detect faces in an OpenCV image array and blur them.

    Args:
        image: OpenCV BGR image array (numpy ndarray)

    Returns:
        Modified OpenCV BGR image array with faces blurred
    """
    image_copy = image.copy()
    gray = cv2.cvtColor(image_copy, cv2.COLOR_BGR2GRAY)

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30)
    )

    for (x, y, w, h) in faces:
        roi = image_copy[y:y + h, x:x + w]

        if roi.size == 0:
            continue

        blur = cv2.GaussianBlur(roi, (99, 99), 30)
        image_copy[y:y + h, x:x + w] = blur

    return image_copy
