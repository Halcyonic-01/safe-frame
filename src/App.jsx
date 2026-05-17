import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./index.css";

import CustomCursor from "./components/CustomCursor.jsx";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import DemoPage from "./pages/DemoPage";
import Dashboard from "./pages/Dashboard";

const pageVariants = {
  initial: { opacity: 0, y: 24, filter: "blur(4px)" },
  animate: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0, y: -16, filter: "blur(3px)",
    transition: { duration: 0.35, ease: "easeIn" },
  },
};

export default function App() {
  const [currentPage, setCurrentPage] = useState("landing");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  return (
    <div className="noise-overlay bg-void min-h-screen text-ice font-body">
      <CustomCursor />
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {currentPage === "landing" && (
            <LandingPage setCurrentPage={setCurrentPage} />
          )}
          {currentPage === "demo" && (
            <DemoPage setCurrentPage={setCurrentPage} />
          )}
          {currentPage === "dashboard" && (
            <Dashboard setCurrentPage={setCurrentPage} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}