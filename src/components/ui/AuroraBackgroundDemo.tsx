"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { TextGenerateEffect } from "./text-generate-effect";
import { InteractiveHoverButton } from "./interactive-hover-button";
import { usePrivy } from "@privy-io/react-auth";
import { generateChatId } from "@/lib/utils";
import { AuroraBackground } from "./aurora-background";
import { toast } from "react-hot-toast"

const words = "Experience the most seamless Agentic Blockchain LLM you have ever had.";

export function AuroraBackgroundDemo() {
  const router = useRouter();
  const { login, authenticated } = usePrivy();

  const handleStartChat = () => {
    if (!authenticated) {
      login();
      return;
    }
    const chatId = generateChatId();
    toast.success('Chat Started!');
    router.push(`/chat/${chatId}`);
  };

  return (
    <AuroraBackground className="h-screen relative bg-black">
      <div className="relative h-full flex items-center">
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="relative w-full flex flex-col gap-6 items-center justify-center px-4 pt-16"
        >
          <div className="text-6xl md:text-7xl text-white text-center font-Teknaf tracking-wider">
            Introducing
            <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent underline font-bold stroke-white ml-3">
              S. Y. N. X.
            </span>
          </div>
            <h4 className="font-thin text-gray-400">Self-evolving Yottascale Network eXchange</h4>
          <div className="font-extralight text-base md:text-2xl text-gray-200 py-4 text-center">
            <TextGenerateEffect words={words} />
          </div>
          <button
            onClick={handleStartChat}
            className="bg-black rounded-full w-fit text-white px-6 py-3 hover:scale-105 hover:bg-white hover:text-black duration-200"
          >
            {authenticated ? 'Chat Now' : 'Connect Wallet to Chat'}
          </button>
          <div>
            <h3 className="text-gray-400 text-sm">Powered by CDP and Privy</h3>
          </div>
        </motion.div>

        {/* Bottom right connection status */}
        <div className="absolute bottom-8 right-8">
          <InteractiveHoverButton 
            className="border-white/10 text-white"
            onClick={() => {
              toast.success('GM GM!', {
                icon: '🫡',
                duration: 1500
              });
            }}
          >
            {authenticated ? 'Connected' : 'Connect Wallet'}
          </InteractiveHoverButton>
        </div>
      </div>
    </AuroraBackground>
  );
}