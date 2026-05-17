/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        fontFamily: {
          display: ["'Syne'", "sans-serif"],
          body: ["'DM Sans'", "sans-serif"],
          mono: ["'JetBrains Mono'", "monospace"],
        },
        colors: {
          void: "#060608",
          obsidian: "#0c0c10",
          surface: "#111116",
          panel: "#16161d",
          border: "#1e1e28",
          muted: "#2a2a38",
          ghost: "#3a3a50",
          dim: "#6b6b88",
          silver: "#a0a0c0",
          snow: "#e8e8f0",
          ice: "#f0f0fa",
          arc: "#5b8fff",
          arcLight: "#88aaff",
          arcDim: "#2d4a99",
          violet: "#8b5cf6",
          violetLight: "#a78bfa",
          violetDim: "#4c1d95",
          plasma: "#c084fc",
          jade: "#34d399",
          ember: "#fb7185",
        },
        animation: {
          "float-slow": "floatSlow 8s ease-in-out infinite",
          "float-med": "floatMed 6s ease-in-out infinite",
          "pulse-glow": "pulseGlow 3s ease-in-out infinite",
          "scan": "scan 3s linear infinite",
          "noise": "noise 0.5s steps(2) infinite",
        },
        keyframes: {
          floatSlow: {
            "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
            "50%": { transform: "translateY(-18px) rotate(0.5deg)" },
          },
          floatMed: {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-10px)" },
          },
          pulseGlow: {
            "0%, 100%": { opacity: "0.4" },
            "50%": { opacity: "0.8" },
          },
          scan: {
            "0%": { transform: "translateY(-100%)" },
            "100%": { transform: "translateY(400%)" },
          },
          noise: {
            "0%": { backgroundPosition: "0 0" },
            "100%": { backgroundPosition: "100% 100%" },
          },
        },
        backdropBlur: {
          xs: "2px",
        },
        boxShadow: {
          "glow-arc": "0 0 30px rgba(91,143,255,0.25), 0 0 60px rgba(91,143,255,0.1)",
          "glow-violet": "0 0 30px rgba(139,92,246,0.25), 0 0 60px rgba(139,92,246,0.1)",
          "glow-sm": "0 0 15px rgba(91,143,255,0.2)",
          "float": "0 20px 60px rgba(0,0,0,0.6), 0 4px 20px rgba(0,0,0,0.4)",
          "panel": "0 0 0 1px rgba(91,143,255,0.08), 0 20px 50px rgba(0,0,0,0.5)",
          "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.06)",
        },
      },
    },
    plugins: [],
  };