import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://127.0.0.1:5050";

const PIPELINE_OPTIONS = [
  { key: "face", label: "Face Detection", color: "arc" },
  { key: "ocr", label: "Text & PII", color: "violet" },
  { key: "qr", label: "QR / Barcodes", color: "plasma" },
  { key: "vehicle", label: "License Plates", color: "jade" },
];

const STAGES = ["idle", "uploading", "processing", "done", "error"];

export default function DemoPage() {
  const [stage, setStage] = useState("idle");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [resultFilename, setResultFilename] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [draggingFile, setDraggingFile] = useState(false);
  const [pipelines, setPipelines] = useState({ face: true, ocr: true, qr: true, vehicle: false });
  const [progress, setProgress] = useState(0);
  const [sliderPos, setSliderPos] = useState(50);
  const sliderRef = useRef(null);
  const sliderDragging = useRef(false);
  const fileInputRef = useRef(null);

  const selectedPipelines = Object.entries(pipelines)
    .filter(([, v]) => v)
    .map(([k]) => k);

  const isImage = (file) => /\.(jpg|jpeg|png)$/i.test(file.name);
  const isVideo = (file) => /\.(mp4|avi|mov)$/i.test(file.name);

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!isImage(file) && !isVideo(file)) {
      setErrorMsg("Unsupported file type. Use JPG, PNG, MP4, AVI, or MOV.");
      setStage("error");
      return;
    }
    setSelectedFile(file);
    setResultUrl(null);
    setResultFilename("");
    setErrorMsg("");
    setStage("idle");

    // Generate preview for images
    if (isImage(file)) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDraggingFile(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const runProcess = useCallback(async () => {
    if (!selectedFile || selectedPipelines.length === 0) return;

    setStage("uploading");
    setProgress(0);
    setResultUrl(null);
    setErrorMsg("");

    // Simulate upload progress
    let p = 0;
    const uploadInterval = setInterval(() => {
      p += 8;
      setProgress(Math.min(p, 30));
      if (p >= 30) clearInterval(uploadInterval);
    }, 50);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      selectedPipelines.forEach((pipeline) => {
        formData.append("pipelines", pipeline);
      });

      setStage("processing");

      // Simulate processing progress
      let pp = 30;
      const processInterval = setInterval(() => {
        pp += 2;
        setProgress(Math.min(pp, 90));
        if (pp >= 90) clearInterval(processInterval);
      }, 100);

      const response = await fetch(`${API_URL}/process`, {
        method: "POST",
        body: formData,
      });

      clearInterval(processInterval);

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Processing failed");
      }

      // Get the blob and create download URL
      const blob = await response.blob();
      const name = selectedFile.name.replace(/(\.[^.]+)$/, "_blur$1");
      const url = URL.createObjectURL(blob);

      setProgress(100);
      setResultUrl(url);
      setResultFilename(name);
      setStage("done");
    } catch (err) {
      clearInterval(uploadInterval);
      console.error(err);
      setErrorMsg(err.message || "Connection failed. Is the backend running?");
      setStage("error");
    }
  }, [selectedFile, selectedPipelines]);

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = resultFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const reset = () => {
    setStage("idle");
    setProgress(0);
    setSelectedFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setResultFilename("");
    setErrorMsg("");
  };

  const togglePipeline = (key) => {
    setPipelines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Comparison slider handlers
  const handleSliderMouseDown = () => { sliderDragging.current = true; };
  const handleSliderMouseUp = () => { sliderDragging.current = false; };
  const handleSliderMouseMove = (e) => {
    if (!sliderDragging.current || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setSliderPos(x * 100);
  };

  return (
    <div className="min-h-screen mesh-bg pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="font-mono text-xs text-arc tracking-widest uppercase mb-4">Live Processing</div>
          <h1 className="font-display text-5xl font-700 gradient-text-subtle mb-4">
            Protect your media
          </h1>
          <p className="font-body text-dim max-w-md mx-auto">
            Upload any image or video, select privacy pipelines, and download the redacted result — all locally.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left: Upload + controls */}
          <div className="lg:col-span-2 space-y-5">

            {/* Upload zone */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <motion.div
                onDragOver={(e) => { e.preventDefault(); setDraggingFile(true); }}
                onDragLeave={() => setDraggingFile(false)}
                onDrop={handleDrop}
                animate={{
                  borderColor: draggingFile ? "rgba(91,143,255,0.6)" : "rgba(91,143,255,0.15)",
                  boxShadow: draggingFile ? "0 0 30px rgba(91,143,255,0.2)" : "none",
                }}
                className="glass panel-float rounded-2xl p-8 border-2 border-dashed border-arc/20 cursor-pointer text-center transition-all duration-300 group"
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.mp4,.avi,.mov"
                  onChange={handleInputChange}
                  className="hidden"
                />
                <motion.div
                  animate={{ y: draggingFile ? -6 : 0 }}
                  className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-arc/20 to-violet/20 flex items-center justify-center border border-arc/20"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5b8fff" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                </motion.div>

                {selectedFile ? (
                  <>
                    <div className="font-display text-sm font-600 text-silver mb-1">
                      {selectedFile.name}
                    </div>
                    <div className="font-body text-xs text-dim">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB — click to change
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-display text-sm font-600 text-silver mb-1">
                      {draggingFile ? "Drop to upload" : "Drop image/video here"}
                    </div>
                    <div className="font-body text-xs text-dim">
                      or click to browse (JPG, PNG, MP4, AVI, MOV)
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>

            {/* Pipeline toggles */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.8 }}
              className="glass panel-float rounded-2xl p-5"
            >
              <div className="font-mono text-xs text-dim uppercase tracking-widest mb-4">Privacy Pipelines</div>
              {PIPELINE_OPTIONS.map((item) => (
                <Toggle
                  key={item.key}
                  label={item.label}
                  active={pipelines[item.key]}
                  color={item.color}
                  onToggle={() => togglePipeline(item.key)}
                />
              ))}

              {selectedPipelines.length === 0 && (
                <div className="mt-3 font-mono text-xs text-ember">
                  ⚠ Select at least one pipeline
                </div>
              )}
            </motion.div>

            {/* Process button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={
                stage === "done" || stage === "error"
                  ? reset
                  : stage === "idle" && selectedFile && selectedPipelines.length > 0
                  ? runProcess
                  : null
              }
              disabled={
                (stage === "idle" && (!selectedFile || selectedPipelines.length === 0)) ||
                stage === "uploading" ||
                stage === "processing"
              }
              className={`w-full py-4 rounded-xl font-display text-sm font-600 transition-all duration-300 relative overflow-hidden ${
                stage === "done"
                  ? "border border-jade/40 text-jade hover:bg-jade/10"
                  : stage === "error"
                  ? "border border-ember/40 text-ember hover:bg-ember/10"
                  : stage === "idle" && selectedFile && selectedPipelines.length > 0
                  ? "btn-arc text-white"
                  : "bg-panel text-dim border border-border cursor-not-allowed"
              }`}
              style={
                stage === "idle" && selectedFile && selectedPipelines.length > 0
                  ? { boxShadow: "0 0 25px rgba(91,143,255,0.3)" }
                  : {}
              }
              whileHover={
                stage === "idle" || stage === "done" || stage === "error"
                  ? { scale: 1.02, y: -1 }
                  : {}
              }
              whileTap={
                stage === "idle" || stage === "done" || stage === "error"
                  ? { scale: 0.98 }
                  : {}
              }
            >
              {stage === "idle" && !selectedFile && "Upload a file first"}
              {stage === "idle" && selectedFile && selectedPipelines.length === 0 && "Select pipelines"}
              {stage === "idle" && selectedFile && selectedPipelines.length > 0 && "🛡 Process & Redact"}
              {stage === "uploading" && `Uploading... ${progress}%`}
              {stage === "processing" && `Processing... ${progress}%`}
              {stage === "done" && "✓ Done — Process Another"}
              {stage === "error" && "✕ Error — Try Again"}

              {(stage === "uploading" || stage === "processing") && (
                <motion.div
                  className="absolute inset-0 bg-violet/20 rounded-xl origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: progress / 100 }}
                  style={{ transformOrigin: "left" }}
                />
              )}
            </motion.button>

            {/* Download button */}
            <AnimatePresence>
              {stage === "done" && resultUrl && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={handleDownload}
                  className="w-full py-3.5 rounded-xl font-display text-sm font-600 btn-arc text-white relative z-0"
                  style={{ boxShadow: "0 0 25px rgba(52,211,153,0.3)" }}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ↓ Download {resultFilename}
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Preview */}
          <div className="lg:col-span-3 space-y-5">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="glass panel-float rounded-2xl p-5"
            >
              {/* Status bar */}
              <div className="flex items-center justify-between mb-4">
                <div className="font-mono text-xs text-dim uppercase tracking-widest">Preview</div>
                <div className="flex items-center gap-2">
                  <AnimatePresence mode="wait">
                    {stage !== "idle" && (
                      <motion.div
                        key={stage}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-1.5"
                      >
                        {(stage === "uploading" || stage === "processing") && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="w-3 h-3 border border-arc/50 border-t-arc rounded-full"
                          />
                        )}
                        <span className="font-mono text-xs" style={{
                          color: stage === "done" ? "#34d399"
                            : stage === "error" ? "#fb7185"
                            : stage === "processing" ? "#c084fc"
                            : "#5b8fff"
                        }}>
                          {stage === "uploading" && "Uploading"}
                          {stage === "processing" && "Processing"}
                          {stage === "done" && "✓ Complete"}
                          {stage === "error" && "✕ Failed"}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Image/Video preview area */}
              <div className="relative rounded-xl overflow-hidden bg-obsidian border border-border/50" style={{ minHeight: "280px" }}>
                {!selectedFile && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl text-ghost mb-3">◫</div>
                      <div className="font-mono text-xs text-ghost">Upload a file to preview</div>
                    </div>
                  </div>
                )}

                {selectedFile && previewUrl && !resultUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                )}

                {selectedFile && !previewUrl && !resultUrl && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl text-ghost mb-3">🎬</div>
                      <div className="font-mono text-xs text-silver">{selectedFile.name}</div>
                      <div className="font-mono text-xs text-dim mt-1">Video preview after processing</div>
                    </div>
                  </div>
                )}

                {/* Before/After comparison for images */}
                {stage === "done" && resultUrl && previewUrl && (
                  <div
                    ref={sliderRef}
                    className="relative w-full cursor-ew-resize select-none"
                    onMouseMove={handleSliderMouseMove}
                    onMouseUp={handleSliderMouseUp}
                    onMouseLeave={handleSliderMouseUp}
                  >
                    {/* Original (full width) */}
                    <img
                      src={previewUrl}
                      alt="Original"
                      className="w-full h-auto max-h-96 object-contain"
                    />

                    {/* Processed (clipped) */}
                    <div
                      className="absolute inset-0"
                      style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                    >
                      <img
                        src={resultUrl}
                        alt="Processed"
                        className="w-full h-auto max-h-96 object-contain"
                      />
                    </div>

                    {/* Labels */}
                    <div className="absolute top-3 left-3 font-mono text-xs text-silver/60 bg-black/60 px-2 py-1 rounded">ORIGINAL</div>
                    <div className="absolute top-3 right-3 font-mono text-xs text-jade/80 bg-black/60 px-2 py-1 rounded">REDACTED</div>

                    {/* Slider handle */}
                    <motion.div
                      className="absolute top-0 bottom-0 flex items-center justify-center cursor-ew-resize"
                      style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
                      onMouseDown={handleSliderMouseDown}
                    >
                      <div className="w-0.5 h-full bg-gradient-to-b from-transparent via-arc to-transparent absolute" />
                      <div
                        className="w-9 h-9 rounded-full bg-gradient-to-br from-arc to-violet flex items-center justify-center relative z-10"
                        style={{ boxShadow: "0 0 20px rgba(91,143,255,0.6)" }}
                      >
                        <svg width="14" height="10" viewBox="0 0 14 10" fill="white">
                          <path d="M0 5h14M5 1L1 5l4 4M9 1l4 4-4 4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                        </svg>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Result only (video or no original preview) */}
                {stage === "done" && resultUrl && !previewUrl && (
                  <div className="p-6 text-center">
                    <div className="text-4xl text-jade mb-3">✓</div>
                    <div className="font-display text-lg text-silver mb-2">Processing Complete</div>
                    <div className="font-mono text-xs text-dim">{resultFilename}</div>
                  </div>
                )}

                {/* Processing overlay */}
                {(stage === "uploading" || stage === "processing") && selectedFile && (
                  <div className="absolute inset-0 bg-void/60 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="text-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                        className="w-10 h-10 border-2 border-arc/30 border-t-arc rounded-full mx-auto mb-4"
                      />
                      <div className="font-mono text-sm text-arc mb-1">
                        {stage === "uploading" ? "Uploading..." : "Running pipelines..."}
                      </div>
                      <div className="font-mono text-xs text-dim">
                        {selectedPipelines.join(", ")}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Error display */}
              <AnimatePresence>
                {stage === "error" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 rounded-xl bg-ember/10 border border-ember/30"
                  >
                    <div className="font-mono text-xs text-ember">{errorMsg}</div>
                    <div className="font-body text-xs text-dim mt-2">
                      Make sure the Flask backend is running on port 5000
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Processing info */}
              <AnimatePresence>
                {stage === "done" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-border"
                  >
                    <div className="font-mono text-xs text-dim uppercase tracking-widest mb-3">Applied Pipelines</div>
                    <div className="space-y-2">
                      {selectedPipelines.map((p, i) => {
                        const opt = PIPELINE_OPTIONS.find(o => o.key === p);
                        return (
                          <motion.div
                            key={p}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-jade" />
                              <span className="font-mono text-xs text-silver">{opt?.label || p}</span>
                            </div>
                            <span className="font-mono text-xs text-jade">APPLIED</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, active, color, onToggle }) {
  const colorMap = {
    arc: "#5b8fff",
    violet: "#8b5cf6",
    plasma: "#c084fc",
    jade: "#34d399",
    ember: "#fb7185",
  };

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
      <span className="font-body text-sm text-silver">{label}</span>
      <motion.button
        onClick={onToggle}
        className="relative rounded-full transition-colors duration-300"
        style={{
          background: active ? `${colorMap[color]}30` : "rgba(42,42,56,0.8)",
          border: `1px solid ${active ? colorMap[color] + "60" : "rgba(58,58,80,0.5)"}`,
          width: "40px",
          height: "22px",
        }}
      >
        <motion.div
          animate={{ x: active ? 18 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1/2 rounded-full"
          style={{
            background: active ? colorMap[color] : "#3a3a50",
            y: "-50%",
            top: "50%",
            boxShadow: active ? `0 0 8px ${colorMap[color]}80` : "none",
            width: "14px",
            height: "14px",
          }}
        />
      </motion.button>
    </div>
  );
}