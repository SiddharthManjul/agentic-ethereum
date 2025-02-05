"use client";

import ChatInterface from "../../../components/ChatInterface";
import { Button } from "../../../components/ui/button";
import { motion } from "framer-motion";
import { LogOut, BrainCircuit } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useParams } from 'next/navigation';


export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Custom Chat Nav */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="backdrop-blur-md bg-black/30 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <BrainCircuit color="white" size={24} />
                <span className="text-white/60 font-mono text-sm">
                  Chat ID: {params?.chatId}
                </span>
              </div>
              <Button
                onClick={() => {
                  router.push('/');
                  toast.error('Left the chat successfully!');
                }}
                className="bg-red-900/80 hover:bg-red-900 text-white px-4 py-2 transition-colors rounded"
              >
                <LogOut className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Exit Chat</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chat Interface */}
      <div className="flex-1 pt-20 pb-4">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}