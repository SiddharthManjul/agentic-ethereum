"use client";

import { motion } from "framer-motion";
import React from "react";
import { AuroraBackground } from "../ui/aurora-background";
import { TextGenerateEffect } from "./text-generate-effect";
const words = "Experience the most seamless transactional chat you have ever had.";

export function AuroraBackgroundDemo() {
  return (
    <AuroraBackground className="bg-black cursor-default">
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-6 items-center justify-center px-4"
      >
        <div className="text-6xl md:text-7xl text-white text-center font-Teknaf tracking-wider">
          Introducing 
          <span className="
          bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent underline font-bold stroke-white ml-3">
           Y. U. M. I.
            </span>
        </div>
        <div className="font-extralight text-base md:text-2xl text-gray-200 py-4 text-center">
          <TextGenerateEffect words={words} />
        </div>
        <button className="bg-black rounded-full w-fit text-white px-6 py-3 hover:scale-105 hover:bg-white hover:text-black duration-200">
          Chat Now
        </button>
        {/* <div>
          <h3 className="text-gray-400 text-sm">Powered by CDP and Privy</h3>
        </div> */}
      </motion.div>
    </AuroraBackground>
  );
}
