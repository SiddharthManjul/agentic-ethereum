"use client";
import { motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";

export function Navbar({ homeSectionRef }: { homeSectionRef: React.RefObject<HTMLDivElement | null> }) {
  const scrollToHome = () => {
    if (homeSectionRef.current) {
      homeSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto">
        <div className="backdrop-blur-md bg-black/30 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 ">
              <div className="flex items-center flex-row space-x-2 cursor-pointer" onClick={scrollToHome}>
                <div>
                  <BrainCircuit color="white" size={36} />
                </div>
                <div className="text-white font-Teknaf text-xl tracking-wider uppercase font-semibold">Y. U. M. I.</div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm transition-all duration-200">
                  About
                </button>
                <button className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm transition-all duration-200">
                  Features
                </button>
                <button className="bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-full text-sm border border-white/20 transition-all duration-300">
                  Connect Wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}