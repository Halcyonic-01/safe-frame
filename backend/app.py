"""
SafeFrame Flask Backend
Main API server for processing images and videos through privacy pipelines.
"""

import os
import cv2
import json
import traceback
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

# Import pipelines
from pipelines.face import process_image_array as face_process
from pipelines.ocr import process_image_array as ocr_process
from pipelines.qr import process_image_array as qr_process
from pipelines.vehicle import process_image_array as vehicle_process
from video_utils import process_video

# ---------------------
# App Configuration
# ---------------------
app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
OUTPUT_FOLDER = os.path.join(os.path.dirname(__file__), 'outputs')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Supported file extensions
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png'}
VIDEO_EXTENSIONS = {'.mp4', '.avi', '.mov'}

# Pipeline registry
PIPELINES = {
    "ocr": ocr_process,
    "face": face_process,
    "qr": qr_process,
    "vehicle": vehicle_process,
}


def get_file_type(filename):
    """Determine if a file is an image, video, or unsupported."""
    ext = os.path.splitext(filename)[1].lower()
    if ext in IMAGE_EXTENSIONS:
        return "image"
    elif ext in VIDEO_EXTENSIONS:
        return "video"
    return None


# ---------------------
# Health Check
# ---------------------
@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "ok",
        "pipelines": list(PIPELINES.keys()),
        "supported_images": list(IMAGE_EXTENSIONS),
        "supported_videos": list(VIDEO_EXTENSIONS),
    })


# ---------------------
# Main Processing Endpoint
# ---------------------
@app.route('/process', methods=['POST'])
def process_file():
    """
    Process an uploaded image or video through selected pipelines.

    Expects multipart/form-data with:
        - file: The image or video file
        - pipelines: One or more pipeline names (ocr, face, qr, vehicle)

    Returns:
        The processed file as a download
    """
    # Validate file
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400

    # Validate pipelines
    selected_pipelines = request.form.getlist('pipelines')
    if not selected_pipelines:
        return jsonify({"error": "No pipelines selected"}), 400

    # Validate pipeline names
    invalid = [p for p in selected_pipelines if p not in PIPELINES]
    if invalid:
        return jsonify({
            "error": f"Invalid pipeline(s): {invalid}",
            "available": list(PIPELINES.keys())
        }), 400

    # Check file type
    filename = secure_filename(file.filename)
    file_type = get_file_type(filename)
    if file_type is None:
        return jsonify({
            "error": f"Unsupported file type: {filename}",
            "supported": list(IMAGE_EXTENSIONS | VIDEO_EXTENSIONS)
        }), 400

    try:
        # Save uploaded file
        input_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(input_path)

        # Build output filename: originalname_blur.ext
        name, ext = os.path.splitext(filename)
        output_filename = f"{name}_blur{ext}"
        output_path = os.path.join(OUTPUT_FOLDER, output_filename)

        # Get pipeline functions in order
        pipeline_funcs = [PIPELINES[p] for p in selected_pipelines]

        print(f"[INFO] Processing {filename} with pipelines: {selected_pipelines}")

        if file_type == "image":
            # Image processing
            image = cv2.imread(input_path)
            if image is None:
                return jsonify({"error": "Could not read image"}), 500

            # Apply pipelines sequentially
            processed = image
            for func in pipeline_funcs:
                processed = func(processed)

            cv2.imwrite(output_path, processed)

        elif file_type == "video":
            # Video processing
            process_video(input_path, output_path, pipeline_funcs)

        print(f"[INFO] Output saved: {output_filename}")

        # Determine MIME type
        mime_map = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.mp4': 'video/mp4',
            '.avi': 'video/x-msvideo',
            '.mov': 'video/quicktime',
        }
        mime_type = mime_map.get(ext.lower(), 'application/octet-stream')

        return send_file(
            output_path,
            mimetype=mime_type,
            as_attachment=True,
            download_name=output_filename,
        )

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

    finally:
        # Cleanup uploaded file (keep output for potential re-download)
        if os.path.exists(input_path):
            os.remove(input_path)


# ---------------------
# Run Server
# ---------------------
if __name__ == '__main__':
    print("=" * 50)
    print("  SafeFrame Backend Server")
    print(f"  Pipelines: {list(PIPELINES.keys())}")
    print("  Running on http://127.0.0.1:5050")
    print("=" * 50)
    app.run(host='127.0.0.1', port=5050, debug=True)
