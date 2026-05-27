import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://127.0.0.1:5050";

const PIPELINE_OPTIONS = [
  { key: "face", label: "Face Detection", color: "arc" },
  { key: "ocr", label: "Text & PII", color: "violet" },
  { key: "qr", label: "QR Codes", color: "plasma" },
  { key: "vehicle", label: "License Plates", color: "jade" },
];

function StatCard({ value, label, trend, color }) {
  const colorMap = {
    arc: { text: "text-arc", border: "border-arc/10" },
    violet: { text: "text-violetLight", border: "border-violet/10" },
    jade: { text: "text-jade", border: "border-jade/10" },
    ember: { text: "text-ember", border: "border-ember/10" },
  };
  const c = colorMap[color] || colorMap.arc;

  return (
    <motion.div
      className={`glass panel-float rounded-2xl p-5 border ${c.border}`}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
    >
      <div className={`font-display text-3xl font-700 ${c.text} mb-1`}>{value}</div>
      <div className="font-body text-xs text-dim uppercase tracking-widest">{label}</div>
      {trend && (
        <div className="font-mono text-xs text-jade mt-2">↑ {trend}</div>
      )}
    </motion.div>
  );
}

function FileRow({ file, index, isSelected, onClick }) {
  const statusConfig = {
    done: { color: "text-jade", dot: "bg-jade", label: "Complete" },
    processing: { color: "text-arc", dot: "bg-arc", label: "Processing" },
    error: { color: "text-ember", dot: "bg-ember", label: "Error" },
  };
  const s = statusConfig[file.status] || statusConfig.done;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={onClick}
      className={`flex items-center gap-4 py-3 border-b border-border/40 last:border-0 group cursor-pointer rounded-lg px-2 -mx-2 transition-colors duration-200 ${
        isSelected ? "bg-arc/6" : "hover:bg-white/2"
      }`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${s.dot} ${file.status === "processing" ? "animate-pulse" : ""}`} />
      <div className="flex-1 min-w-0">
        <div className="font-body text-sm text-silver truncate">{file.name}</div>
        <div className="font-mono text-xs text-dim">{file.size}</div>
      </div>
      <div className="flex items-center gap-3 text-xs font-mono">
        <span className="text-arc">{file.pipelines.length}P</span>
      </div>
      <span className={`font-mono text-xs ${s.color}`}>{s.label}</span>
    </motion.div>
  );
}

export default function Dashboard({ setCurrentPage }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [pipelines, setPipelines] = useState({ face: true, ocr: true, qr: true, vehicle: false });
  const [processedFiles, setProcessedFiles] = useState(() => {
    try {
      const saved = localStorage.getItem("sf_processedFiles");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [activity, setActivity] = useState(() => {
    try {
      const saved = localStorage.getItem("sf_activity");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [backendStatus, setBackendStatus] = useState("checking");
  const [totalProcessed, setTotalProcessed] = useState(() => {
    const saved = localStorage.getItem("sf_totalProcessed");
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem("sf_processedFiles", JSON.stringify(processedFiles));
  }, [processedFiles]);

  useEffect(() => {
    localStorage.setItem("sf_activity", JSON.stringify(activity));
  }, [activity]);

  useEffect(() => {
    localStorage.setItem("sf_totalProcessed", totalProcessed.toString());
  }, [totalProcessed]);
  const fileInputRef = useRef(null);

  const [sliderPos, setSliderPos] = useState(50);
  const sliderRef = useRef(null);
  const sliderDragging = useRef(false);

  const handleSliderMouseDown = () => { sliderDragging.current = true; };
  const handleSliderMouseUp = () => { sliderDragging.current = false; };
  const handleSliderMouseMove = (e) => {
    if (!sliderDragging.current || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setSliderPos(x * 100);
  };

  const selectedPipelines = Object.entries(pipelines)
    .filter(([, v]) => v)
    .map(([k]) => k);

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_URL}/health`);
        if (res.ok) {
          setBackendStatus("online");
        } else {
          setBackendStatus("offline");
        }
      } catch {
        setBackendStatus("offline");
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const addActivity = (action) => {
    setActivity((prev) => [
      { time: "Just now", action, icon: "◈" },
      ...prev.slice(0, 9),
    ]);
  };

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setDragging(false);

    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      await processFile(file);
    }
  }, [pipelines]);

  const handleInputChange = (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      processFile(file);
    }
    e.target.value = "";
  };

  const processFile = async (file) => {
    if (selectedPipelines.length === 0) {
      addActivity(`⚠ No pipelines selected for ${file.name}`);
      return;
    }

    const fileEntry = {
      id: Date.now() + Math.random(),
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      status: "processing",
      pipelines: selectedPipelines,
      resultUrl: null,
      resultName: "",
      originalUrl: /\.(jpg|jpeg|png)$/i.test(file.name) ? URL.createObjectURL(file) : null,
    };

    setProcessedFiles((prev) => [fileEntry, ...prev]);
    setSelectedFile(fileEntry);
    setProcessing(true);
    addActivity(`Started processing ${file.name}`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      selectedPipelines.forEach((p) => formData.append("pipelines", p));

      const response = await fetch(`${API_URL}/process`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Processing failed");
      }

      const blob = await response.blob();
      const resultName = file.name.replace(/(\.[^.]+)$/, "_blur$1");
      const resultUrl = URL.createObjectURL(blob);

      setProcessedFiles((prev) =>
        prev.map((f) =>
          f.id === fileEntry.id
            ? { ...f, status: "done", resultUrl, resultName }
            : f
        )
      );

      setSelectedFile((prev) =>
        prev?.id === fileEntry.id
          ? { ...prev, status: "done", resultUrl, resultName }
          : prev
      );

      setTotalProcessed((prev) => prev + 1);
      addActivity(`✓ Completed ${resultName} (${selectedPipelines.join(", ")})`);
    } catch (err) {
      setProcessedFiles((prev) =>
        prev.map((f) =>
          f.id === fileEntry.id ? { ...f, status: "error" } : f
        )
      );
      addActivity(`✕ Failed: ${file.name} — ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = (file) => {
    if (!file?.resultUrl) return;
    const a = document.createElement("a");
    a.href = file.resultUrl;
    a.download = file.resultName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const togglePipeline = (key) => {
    setPipelines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-void pt-20 pb-10 px-6">

      {/* Grid bg */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(91,143,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(91,143,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto">

        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="font-display text-2xl font-700 gradient-text-subtle">Workspace</h1>
            <p className="font-body text-sm text-dim mt-0.5">
              <span className={`font-mono ${backendStatus === "online" ? "text-jade" : "text-ember"}`}>●</span>
              {" "}
              {backendStatus === "online"
                ? "Backend connected"
                : backendStatus === "checking"
                ? "Checking backend..."
                : "Backend offline — start Flask server"}
            </p>
          </div>

        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          <StatCard value={totalProcessed} label="Files Processed" color="arc" />
          <StatCard value={processedFiles.filter((f) => f.status === "done").length} label="Completed" color="jade" />
          <StatCard value={processedFiles.filter((f) => f.status === "processing").length} label="Processing" color="violet" />
          <StatCard
            value={backendStatus === "online" ? "Online" : "Offline"}
            label="Backend Status"
            color={backendStatus === "online" ? "jade" : "ember"}
          />
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-12 gap-4 items-start">

          {/* Upload panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="col-span-12 lg:col-span-4 glass panel-float rounded-2xl p-5 space-y-5"
          >
            <div className="font-mono text-xs text-dim uppercase tracking-widest">Upload</div>

            {/* Drop zone */}
            <motion.div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              animate={{
                borderColor: dragging ? "rgba(91,143,255,0.6)" : "rgba(91,143,255,0.12)",
                background: dragging ? "rgba(91,143,255,0.06)" : "rgba(6,6,8,0.4)",
              }}
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200"
              whileHover={{ scale: 1.01 }}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.mp4,.avi,.mov"
                onChange={handleInputChange}
                className="hidden"
              />
              <AnimatePresence mode="wait">
                {processing ? (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-8 h-8 border-2 border-arc/30 border-t-arc rounded-full"
                    />
                    <div className="font-mono text-xs text-arc">Processing...</div>
                  </motion.div>
                ) : (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="text-3xl text-ghost mb-2">↑</div>
                    <div className="font-display text-sm font-500 text-silver">Drop files here</div>
                    <div className="font-body text-xs text-dim mt-1">JPG, PNG, MP4, AVI, MOV</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Pipeline toggles */}
            <div className="space-y-1">
              <div className="font-mono text-xs text-dim uppercase tracking-widest mb-3">Redaction Controls</div>
              {PIPELINE_OPTIONS.map((item) => (
                <DashToggle
                  key={item.key}
                  label={item.label}
                  active={pipelines[item.key]}
                  color={item.color}
                  onToggle={() => togglePipeline(item.key)}
                />
              ))}
            </div>
          </motion.div>

          {/* File list */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="col-span-12 lg:col-span-5 glass panel-float rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="font-mono text-xs text-dim uppercase tracking-widest">Processed Files</div>
              <div className="font-mono text-xs text-arc">{processedFiles.length} files</div>
            </div>

            {processedFiles.length === 0 ? (
              <div className="py-8 text-center">
                <div className="text-2xl text-ghost mb-2">◫</div>
                <div className="font-mono text-xs text-ghost">No files processed yet</div>
                <div className="font-body text-xs text-dim mt-1">Upload files to get started</div>
              </div>
            ) : (
              <div className="space-y-0 max-h-64 overflow-y-auto">
                {processedFiles.map((file, i) => (
                  <FileRow
                    key={file.id}
                    file={file}
                    index={i}
                    isSelected={selectedFile?.id === file.id}
                    onClick={() => setSelectedFile(file)}
                  />
                ))}
              </div>
            )}

            {/* Activity */}
            <div className="mt-6 pt-5 border-t border-border">
              <div className="font-mono text-xs text-dim uppercase tracking-widest mb-3">Activity</div>
              {activity.length === 0 ? (
                <div className="font-mono text-xs text-ghost">No activity yet</div>
              ) : (
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {activity.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-2.5"
                    >
                      <span className="text-arc/60 text-xs mt-0.5">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-body text-xs text-silver leading-relaxed">{item.action}</div>
                        <div className="font-mono text-xs text-ghost mt-0.5">{item.time}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Preview panel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="col-span-12 lg:col-span-3 glass panel-float rounded-2xl p-5"
            style={{ marginTop: "40px" }}
          >
            <div className="font-mono text-xs text-dim uppercase tracking-widest mb-4">Preview</div>

            <div className="rounded-xl bg-obsidian border border-border/50 overflow-hidden relative min-h-48">
              {selectedFile?.status === "done" && selectedFile?.resultUrl ? (
                <div className="relative">
                  {selectedFile.originalUrl ? (
                    <div
                      ref={sliderRef}
                      className="relative w-full cursor-ew-resize select-none"
                      onMouseMove={handleSliderMouseMove}
                      onMouseUp={handleSliderMouseUp}
                      onMouseLeave={handleSliderMouseUp}
                    >
                      {/* Original (full width) */}
                      <img
                        src={selectedFile.originalUrl}
                        alt="Original"
                        className="w-full h-auto max-h-48 object-contain"
                      />

                      {/* Processed (clipped) */}
                      <div
                        className="absolute inset-0"
                        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                      >
                        <img
                          src={selectedFile.resultUrl}
                          alt="Processed"
                          className="w-full h-auto max-h-48 object-contain"
                        />
                      </div>

                      {/* Labels */}
                      <div className="absolute top-2 left-2 font-mono text-xs text-silver/60 bg-black/60 px-2 py-1 rounded">ORIGINAL</div>
                      <div className="absolute top-2 right-2 font-mono text-xs text-jade/80 bg-black/60 px-2 py-1 rounded">REDACTED</div>

                      {/* Slider handle */}
                      <motion.div
                        className="absolute top-0 bottom-0 flex items-center justify-center cursor-ew-resize"
                        style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
                        onMouseDown={handleSliderMouseDown}
                      >
                        <div className="w-0.5 h-full bg-gradient-to-b from-transparent via-arc to-transparent absolute" />
                        <div
                          className="w-7 h-7 rounded-full bg-gradient-to-br from-arc to-violet flex items-center justify-center relative z-10"
                          style={{ boxShadow: "0 0 15px rgba(91,143,255,0.6)" }}
                        >
                          <svg width="12" height="8" viewBox="0 0 14 10" fill="white">
                            <path d="M0 5h14M5 1L1 5l4 4M9 1l4 4-4 4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                          </svg>
                        </div>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <div className="text-2xl text-jade mb-2">✓</div>
                      <div className="font-mono text-xs text-silver">Ready</div>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 right-2 z-20 pointer-events-none">
                    <div className="glass rounded-lg px-3 py-2 flex items-center justify-between backdrop-blur-md">
                      <span className="font-mono text-xs text-silver truncate">{selectedFile.resultName}</span>
                      <span className="font-mono text-xs text-jade">✓</span>
                    </div>
                  </div>
                </div>
              ) : selectedFile?.status === "processing" ? (
                <div className="p-6 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-8 h-8 border-2 border-arc/30 border-t-arc rounded-full mx-auto mb-3"
                    />
                    <div className="font-mono text-xs text-arc">Processing...</div>
                  </div>
                </div>
              ) : (
                <div className="p-6 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl text-ghost mb-2">◫</div>
                    <div className="font-mono text-xs text-ghost">Select a file to preview</div>
                  </div>
                </div>
              )}
            </div>

            {/* Pipelines used */}
            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 space-y-2"
              >
                <div className="font-mono text-xs text-dim mb-2">Pipelines Used</div>
                {selectedFile.pipelines.map((p) => {
                  const opt = PIPELINE_OPTIONS.find((o) => o.key === p);
                  return (
                    <div key={p} className="flex items-center justify-between">
                      <span className="font-body text-xs text-dim">{opt?.label || p}</span>
                      <span className="font-mono text-xs text-jade">✓</span>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* Export buttons */}
            {selectedFile?.status === "done" && selectedFile?.resultUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-5 pt-4 border-t border-border space-y-2"
              >
                <motion.button
                  onClick={() => handleDownload(selectedFile)}
                  className="w-full py-2.5 rounded-lg btn-arc font-display text-xs font-600 text-white relative z-0"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ boxShadow: "0 0 15px rgba(91,143,255,0.25)" }}
                >
                  ↓ Download Redacted
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Bottom status bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-4 glass panel-float rounded-2xl p-4 flex items-center gap-6"
        >
          <div className="font-mono text-xs text-dim">Backend</div>
          <div className={`w-2 h-2 rounded-full ${backendStatus === "online" ? "bg-jade" : "bg-ember"} ${backendStatus === "online" ? "" : "animate-pulse"}`} />
          <div className="font-mono text-xs text-silver">{API_URL}</div>
          <div className="flex-1" />
          <div className="font-mono text-xs text-dim">Files</div>
          <div className="font-mono text-xs text-silver">{processedFiles.length} processed</div>
        </motion.div>
      </div>
    </div>
  );
}

function DashToggle({ label, active, color, onToggle }) {
  const colorMap = {
    arc: "#5b8fff", violet: "#8b5cf6", plasma: "#c084fc", jade: "#34d399", ember: "#fb7185",
  };
  const c = colorMap[color];

  return (
    <div className="flex items-center justify-between py-2 group">
      <span className="font-body text-sm text-silver">{label}</span>
      <motion.button
        onClick={onToggle}
        className="relative rounded-full transition-all duration-300"
        style={{
          width: "36px", height: "20px",
          background: active ? `${c}25` : "rgba(42,42,56,0.8)",
          border: `1px solid ${active ? c + "50" : "rgba(58,58,80,0.5)"}`,
        }}
      >
        <motion.div
          animate={{ x: active ? 16 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
          className="absolute rounded-full"
          style={{
            top: "50%", y: "-50%",
            width: "12px", height: "12px",
            background: active ? c : "#3a3a50",
            boxShadow: active ? `0 0 8px ${c}80` : "none",
          }}
        />
      </motion.button>
    </div>
  );
}