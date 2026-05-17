# SafeFrame

SafeFrame is a robust, AI-powered privacy protection platform that enables local redaction of sensitive data from images and videos. The application consists of a React-based frontend and a Python-based backend.

## Architecture
- **Frontend**: A sleek, dynamic React interface designed with rich aesthetics and a user-friendly dashboard for uploading and processing media.
- **Backend**: A modular Python backend featuring multiple computer vision pipelines:
  - Face Detection and Redaction
  - OCR (Text) Detection and Redaction
  - QR Code Detection and Redaction
  - Vehicle License Plate Detection and Redaction

## Getting Started

### Prerequisites
- Node.js & npm
- Python 3.8+

### Running the Frontend
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm start
   ```

### Running the Backend
1. Navigate to the `backend` directory.
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the backend application:
   ```bash
   python app.py
   ```
