# SafeFrame 🛡️

SafeFrame is a robust, AI-powered privacy protection platform that enables entirely local, offline redaction of sensitive data from images and videos. Built with privacy-first principles, no media ever leaves your machine—all processing is handled by a locally hosted backend.

## 🌟 Key Features

* **Complete Privacy**: All computer vision and redaction models run locally on your device.
* **Multi-Pipeline Redaction**: Mix and match AI pipelines to blur what you need:
  * 🧑 **Face Detection**: Automatically finds and blurs human faces.
  * 📝 **OCR & PII Detection**: Reads and obscures sensitive text and personally identifiable information.
  * 📱 **QR & Barcode Detection**: Prevents accidental leakage of QR codes or barcodes.
  * 🚗 **Vehicle License Plates**: Redacts vehicle registration plates in photos and videos.
* **Interactive Dashboard**: A sleek, dark-themed React dashboard with a drag-and-drop workspace.
* **Before & After Comparison**: Compare original and redacted images using an interactive, draggable slider view.
* **Persistent Analytics**: Your total processed files and recent activity logs are saved across sessions using local browser storage.
* **Video Support**: Redact frames in `.mp4`, `.avi`, and `.mov` files sequentially.

---

## 🛠️ Technology Stack

### Frontend
* **React 18** (Vite/CRA) for dynamic UI components.
* **TailwindCSS** for rich, glassmorphism-inspired aesthetic styling.
* **Framer Motion** for smooth micro-animations and slider interactions.
* **LocalStorage** for lightweight, persistent analytics.

### Backend
* **Python 3.8+** & **Flask** for the API server.
* **OpenCV (cv2)** for image and video frame manipulation.
* **Ultralytics (YOLO)** for object detection (faces, plates).
* **EasyOCR** for robust text detection.
* **PyZbar** for QR and barcode detection.
* **PyTorch** serving as the deep learning backend.

---

## 🚀 Getting Started

To run SafeFrame locally, you will need to start both the Frontend and the Backend servers. 

### Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher)
* [Python 3.8+](https://www.python.org/downloads/)
* A modern web browser

### 1. Running the Python Backend
The backend handles all heavy lifting and AI processing.

```bash
# Navigate to the backend directory
cd backend

# (Optional) Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install the required Python dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
```
*The backend will run on `http://127.0.0.1:5050`.*

### 2. Running the React Frontend
Open a **new terminal window** in the root of the project to start the frontend.

```bash
# Install npm dependencies
npm install

# Start the React development server
npm start
```
*The frontend will typically run on `http://localhost:3000`.*

---

## 📂 Project Structure

```text
safe-frame/
├── src/                      # React Frontend Source Code
│   ├── components/           # UI Components (Navbar, Sliders)
│   ├── pages/                # Main Views (Dashboard, DemoPage, Landing)
│   ├── index.css             # Tailwind & Global Styles
│   └── App.jsx               # Main React Router/App Component
├── backend/                  # Python Flask Backend
│   ├── app.py                # Main API Server & Routing
│   ├── video_utils.py        # Video frame extraction & compilation
│   ├── requirements.txt      # Python Dependencies
│   └── pipelines/            # Individual AI Pipeline Logic
│       ├── face.py
│       ├── ocr.py
│       ├── qr.py
│       └── vehicle.py
└── package.json              # Frontend Dependencies
```

## 🔐 Privacy Guarantee
SafeFrame is designed to run entirely locally. The Flask backend does not make any external network requests for processing. Images and videos are saved to a temporary `uploads` folder during processing and are immediately removed upon completion.
