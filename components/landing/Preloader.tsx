"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Artificial delay to ensure a smooth transition and show the brand
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
          }}
          className="fixed inset-0 z-[9999] bg-[#FAFAF8] flex items-center justify-center"
        >
          <div className="flex flex-col items-center gap-8">
            {/* Animated Logo */}
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ 
                scale: [0.8, 1.1, 1],
                rotate: [0, 10, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-16 h-16 bg-[#1F2937] rounded-2xl flex items-center justify-center shadow-2xl"
            >
              <motion.div 
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-6 h-6 bg-[#FAFAF8] rounded-[2px]" 
              />
            </motion.div>

            {/* Loading Progress Bar */}
            <div className="w-48 h-[2px] bg-[#1F2937]/5 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "0%" }}
                transition={{ 
                  duration: 1.8,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-[#1F2937]"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-[10px] font-bold text-[#1F2937] uppercase tracking-[0.4em]"
            >
              Making Work Simple
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
