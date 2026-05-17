import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = ["Product", "Demo", "Dashboard"];

export default function Navbar({ currentPage, setCurrentPage }) {
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 transition-all duration-500 ${
        scrolled ? "glass-strong" : ""
      }`}
    >
      {/* Logo */}
      <motion.button
        onClick={() => setCurrentPage("landing")}
        className="flex items-center gap-3 group"
        whileHover={{ scale: 1.02 }}
      >
        <div className="w-8 h-8 relative">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-arc to-violet opacity-80" />
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-arc to-violet blur-md opacity-50" />
          <svg viewBox="0 0 32 32" className="absolute inset-0 w-full h-full p-1.5" fill="none">
            <rect x="6" y="6" width="8" height="8" rx="1.5" fill="rgba(255,255,255,0.9)" />
            <rect x="18" y="6" width="8" height="8" rx="1.5" fill="rgba(255,255,255,0.5)" />
            <rect x="6" y="18" width="8" height="8" rx="1.5" fill="rgba(255,255,255,0.5)" />
            <rect x="18" y="18" width="8" height="8" rx="1.5" fill="rgba(255,255,255,0.2)" />
          </svg>
        </div>
        <span className="font-display font-700 text-lg tracking-tight text-ice">
          Safe<span className="gradient-text">Frame</span>
        </span>
      </motion.button>

      {/* Links */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <motion.button
            key={link}
            onClick={() => {
              if (link === "Demo") setCurrentPage("demo");
              else if (link === "Dashboard") setCurrentPage("dashboard");
              else setCurrentPage("landing");
            }}
            className="relative font-body text-sm text-dim hover:text-silver transition-colors duration-300"
            onMouseEnter={() => setHoveredLink(link)}
            onMouseLeave={() => setHoveredLink(null)}
          >
            {link}
            <AnimatePresence>
              {hoveredLink === link && (
                <motion.span
                  layoutId="nav-underline"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  exit={{ opacity: 0, scaleX: 0 }}
                  className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-arc to-violet"
                />
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      {/* CTA */}
      <motion.button
        onClick={() => setCurrentPage("dashboard")}
        className="btn-arc font-display text-sm font-600 text-white px-5 py-2.5 rounded-lg relative z-0"
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        style={{ boxShadow: "0 0 20px rgba(91,143,255,0.3)" }}
      >
        Open App
      </motion.button>
    </motion.nav>
  );
}