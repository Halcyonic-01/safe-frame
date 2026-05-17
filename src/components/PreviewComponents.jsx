import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BOUNDING_BOXES = [
  { left: "18%", top: "14%", width: "22%", height: "28%", label: "FACE_01" },
  { left: "56%", top: "8%", width: "18%", height: "24%", label: "FACE_02" },
  { left: "10%", top: "62%", width: "28%", height: "16%", label: "TEXT_BLOCK" },
  { left: "62%", top: "68%", width: "12%", height: "12%", label: "QR_CODE" },
];

const MOCK_REDACT_ZONES = [
  { left: "14%", top: "10%", width: "28%", height: "34%", blur: 14 },
  { left: "52%", top: "5%", width: "24%", height: "30%", blur: 14 },
  { left: "8%", top: "58%", width: "34%", height: "22%", blur: 10 },
  { left: "60%", top: "65%", width: "16%", height: "16%", blur: 12 },
];

export function MockImage({ redacted = false, showBoxes = false, progress = 0 }) {
  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden bg-obsidian">
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0.5 opacity-30">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="rounded-sm"
            style={{
              background: [
                "#1a1a2e","#16213e","#0f3460",
                "#1a1a2e","#2d2d44","#16213e",
                "#0f3460","#1a1a2e","#16213e",
              ][i],
            }}
          />
        ))}
      </div>

      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" fill="none">
        <ellipse cx="90" cy="80" rx="24" ry="28" fill="rgba(91,143,255,0.08)" />
        <rect x="66" y="105" width="48" height="80" rx="8" fill="rgba(91,143,255,0.06)" />
        <ellipse cx="228" cy="70" rx="20" ry="24" fill="rgba(139,92,246,0.08)" />
        <rect x="210" y="90" width="40" height="70" rx="8" fill="rgba(139,92,246,0.06)" />
        {[0,1,2,3].map(i => (
          <rect key={i} x="30" y={190 + i * 12} width={120 - i * 15} height="6" rx="2" fill="rgba(160,160,192,0.15)" />
        ))}
        <rect x="250" y="200" width="48" height="48" rx="3" fill="rgba(192,132,252,0.08)" />
        <g fill="rgba(192,132,252,0.2)">
          <rect x="255" y="205" width="12" height="12" rx="1" />
          <rect x="281" y="205" width="12" height="12" rx="1" />
          <rect x="255" y="231" width="12" height="12" rx="1" />
          <rect x="269" y="217" width="6" height="6" rx="0.5" />
          <rect x="281" y="225" width="12" height="6" rx="0.5" />
        </g>
      </svg>

      {showBoxes && !redacted && (
        <motion.div
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-arc to-transparent"
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 1.5, ease: "linear", repeat: 1 }}
          style={{ top: "0%" }}
        />
      )}

      <AnimatePresence>
        {showBoxes && !redacted &&
          BOUNDING_BOXES.map((box, i) => (
            <motion.div
              key={i}
              className="bbox"
              data-label={box.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.15, duration: 0.3 }}
              style={{
                left: box.left,
                top: box.top,
                width: box.width,
                height: box.height,
              }}
            />
          ))}
      </AnimatePresence>

      <AnimatePresence>
        {redacted &&
          MOCK_REDACT_ZONES.map((zone, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="absolute rounded-sm overflow-hidden"
              style={{
                left: zone.left,
                top: zone.top,
                width: zone.width,
                height: zone.height,
                backdropFilter: `blur(${zone.blur}px)`,
                WebkitBackdropFilter: `blur(${zone.blur}px)`,
                background: "rgba(91,143,255,0.12)",
                border: "1px solid rgba(91,143,255,0.3)",
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    0deg,
                    rgba(91,143,255,0.1) 0px,
                    rgba(91,143,255,0.1) 2px,
                    transparent 2px,
                    transparent 8px
                  ),
                  repeating-linear-gradient(
                    90deg,
                    rgba(139,92,246,0.1) 0px,
                    rgba(139,92,246,0.1) 2px,
                    transparent 2px,
                    transparent 8px
                  )`,
                }}
              />
            </motion.div>
          ))}
      </AnimatePresence>

      {redacted && progress < 100 && (
        <motion.div
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet to-transparent"
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 0.8, ease: "linear" }}
          style={{ top: "0%" }}
        />
      )}
    </div>
  );
}

export function ComparisonSlider() {
  const [position, setPosition] = useState(50);
  const sliderRef = useRef(null);
  const dragging = useRef(false);

  const handleMouseDown = () => { dragging.current = true; };
  const handleMouseUp = () => { dragging.current = false; };
  const handleMouseMove = (e) => {
    if (!dragging.current || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setPosition(x * 100);
  };

  return (
    <div
      ref={sliderRef}
      className="relative h-full rounded-xl overflow-hidden cursor-ew-resize select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="absolute inset-0">
        <MockImage redacted={false} showBoxes={false} />
      </div>

      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <MockImage redacted={true} progress={100} />
      </div>

      <div className="absolute top-3 left-3 font-mono text-xs text-silver/60 bg-black/40 px-2 py-1 rounded">ORIGINAL</div>
      <div className="absolute top-3 right-3 font-mono text-xs text-arc/80 bg-black/40 px-2 py-1 rounded">REDACTED</div>

      <motion.div
        className="absolute top-0 bottom-0 flex items-center justify-center cursor-ew-resize"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        onMouseDown={handleMouseDown}
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
  );
}
