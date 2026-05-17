import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const floatingCards = [
  {
    id: 1,
    x: "72%",
    y: "15%",
    delay: 0,
    content: (
      <div className="px-4 py-3 glass panel-float rounded-xl w-52">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-jade animate-pulse" />
          <span className="font-mono text-xs text-jade">Processing</span>
        </div>
        <div className="space-y-1.5">
          {["Face detection", "License plates", "Text blocks"].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="font-body text-xs text-dim">{item}</span>
              <span className="font-mono text-xs text-arc">✓</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 2,
    x: "-8%",
    y: "30%",
    delay: 1.2,
    content: (
      <div className="px-4 py-3 glass panel-float rounded-xl w-44">
        <div className="font-mono text-xs text-dim mb-1">Confidence</div>
        <div className="font-display text-2xl font-700 gradient-text">99.2%</div>
        <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full w-[99%] bg-gradient-to-r from-arc to-violet rounded-full" />
        </div>
      </div>
    ),
  },
  {
    id: 3,
    x: "78%",
    y: "55%",
    delay: 0.6,
    content: (
      <div className="px-4 py-3 glass panel-float rounded-xl w-48">
        <div className="font-mono text-xs text-dim mb-2">Redacted</div>
        <div className="grid grid-cols-3 gap-1">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="h-6 rounded-sm"
              style={{
                background: i % 3 === 0
                  ? "rgba(91,143,255,0.3)"
                  : i % 3 === 1
                  ? "rgba(139,92,246,0.2)"
                  : "rgba(30,30,40,0.8)",
              }}
            />
          ))}
        </div>
      </div>
    ),
  },
];

const stats = [
  { value: "50M+", label: "Images Protected" },
  { value: "< 2s", label: "Processing Time" },
  { value: "99.2%", label: "Detection Rate" },
  { value: "SOC 2", label: "Compliant" },
];

const features = [
  {
    icon: "◈",
    title: "Neural Face Redaction",
    desc: "State-of-the-art models identify and blur every face in a frame — even at extreme angles.",
    accent: "arc",
  },
  {
    icon: "⌘",
    title: "Text & PII Erasure",
    desc: "OCR-powered detection strips names, IDs, license plates, and sensitive text with surgical precision.",
    accent: "violet",
  },
  {
    icon: "◉",
    title: "QR & Barcode Shield",
    desc: "Every scannable code is detected and neutralized before your media goes public.",
    accent: "plasma",
  },
  {
    icon: "⬡",
    title: "Zero-Knowledge Pipeline",
    desc: "Your files never leave your control. Processing is ephemeral. No logs. No retention.",
    accent: "jade",
  },
];

export default function LandingPage({ setCurrentPage }) {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

  const mouseX = useRef(0);
  const mouseY = useRef(0);

  useEffect(() => {
    const handler = (e) => {
      mouseX.current = (e.clientX / window.innerWidth - 0.5) * 20;
      mouseY.current = (e.clientY / window.innerHeight - 0.5) * 20;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div className="relative">
      {/* Hero */}
      <section ref={heroRef} className="mesh-bg relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* Grid lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(91,143,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(91,143,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />

        {/* Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-arc/5 blur-3xl pointer-events-none animate-float-slow" />
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 rounded-full bg-violet/6 blur-3xl pointer-events-none animate-float-med" />

        {/* Floating cards */}
        {floatingCards.map((card) => (
          <motion.div
            key={card.id}
            className="absolute pointer-events-none hidden lg:block"
            style={{ left: card.x, top: card.y }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + card.delay, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{
                duration: 5 + card.delay,
                repeat: Infinity,
                ease: "easeInOut",
                delay: card.delay,
              }}
            >
              {card.content}
            </motion.div>
          </motion.div>
        ))}

        {/* Main content */}
        <motion.div
          style={{ y, opacity, scale }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="inline-flex items-center gap-2.5 glass rounded-full px-4 py-1.5 mb-10 border border-arc/20"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-jade animate-pulse" />
            <span className="font-mono text-xs text-silver tracking-widest uppercase">
              AI-Powered Privacy Redaction
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-6xl md:text-8xl font-800 leading-[0.95] tracking-tight mb-8"
          >
            <span className="block gradient-text-subtle">Redact Reality.</span>
            <span className="block gradient-text glow-text">Protect Privacy.</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="font-body text-lg md:text-xl text-dim max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            SafeFrame uses multimodal AI to instantly detect and redact faces, text, QR codes,
            and sensitive data from any image or video frame — in under 2 seconds.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              onClick={() => setCurrentPage("demo")}
              className="btn-arc font-display text-base font-600 text-white px-8 py-4 rounded-xl relative z-0 group"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              style={{ boxShadow: "0 0 30px rgba(91,143,255,0.35), 0 8px 30px rgba(0,0,0,0.4)" }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Redacting
                <motion.span
                  animate={{ x: [0, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  →
                </motion.span>
              </span>
            </motion.button>

            <motion.button
              onClick={() => setCurrentPage("demo")}
              className="font-body text-sm text-dim hover:text-silver transition-colors duration-300 flex items-center gap-2 px-4 py-3"
              whileHover={{ x: 3 }}
            >
              <span className="w-8 h-px bg-gradient-to-r from-transparent to-ghost inline-block" />
              See live demo
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-void to-transparent pointer-events-none" />

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-px h-10 bg-gradient-to-b from-transparent via-dim to-transparent"
          />
        </motion.div>
      </section>

      {/* Stats bar */}
      <section className="relative py-12 border-y border-border overflow-hidden">
        <div className="shimmer absolute inset-0" />
        <div className="relative max-w-4xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="font-display text-3xl font-700 gradient-text mb-1">{s.value}</div>
              <div className="font-body text-xs text-dim uppercase tracking-widest">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="font-mono text-xs text-arc tracking-widest uppercase mb-4">Capabilities</div>
          <h2 className="font-display text-4xl md:text-5xl font-700 gradient-text-subtle">
            Everything hidden. Nothing lost.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="glass panel-float rounded-2xl p-8 group cursor-pointer relative overflow-hidden"
            >
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle, rgba(${
                    f.accent === "arc" ? "91,143,255" : f.accent === "violet" ? "139,92,246" : f.accent === "plasma" ? "192,132,252" : "52,211,153"
                  },0.08) 0%, transparent 70%)`,
                  transform: "translate(30%, -30%)",
                }}
              />
              <div
                className="text-3xl mb-5"
                style={{
                  color: f.accent === "arc" ? "#5b8fff" : f.accent === "violet" ? "#8b5cf6" : f.accent === "plasma" ? "#c084fc" : "#34d399",
                }}
              >
                {f.icon}
              </div>
              <h3 className="font-display text-xl font-600 text-ice mb-3">{f.title}</h3>
              <p className="font-body text-sm text-dim leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 mesh-bg opacity-60" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-2xl mx-auto"
        >
          <h2 className="font-display text-5xl font-700 glow-text gradient-text mb-6">
            Ready to redact?
          </h2>
          <p className="font-body text-dim mb-10 text-lg">
            Join thousands of teams protecting privacy with SafeFrame.
          </p>
          <motion.button
            onClick={() => setCurrentPage("demo")}
            className="btn-arc font-display text-base font-600 text-white px-10 py-5 rounded-xl relative z-0"
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.97 }}
            style={{ boxShadow: "0 0 40px rgba(91,143,255,0.4), 0 8px 40px rgba(0,0,0,0.4)" }}
          >
            Start Free — No Card Required
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}