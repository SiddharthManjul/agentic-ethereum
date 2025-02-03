"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, Send } from "lucide-react";

export default function ChatInterface() {
  return (
    <Card className="bg-zinc-950 border border-zinc-800 backdrop-blur-sm h-[calc(100vh-7rem)]">
      <div className="h-[600px] flex flex-col">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* User Message */}
          <div className="flex items-start gap-3 justify-end">
            <div className="bg-zinc-800/80 rounded-2xl p-4 max-w-[80%] border border-blue-700">
              <p className="text-sm text-white">Can you help me understand how machine learning works?</p>
            </div>
            <Avatar className="h-8 w-8 border border-zinc-700">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>

          {/* AI Message */}
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8 bg-gradient-to-r from-red-500 to-orange-500 border border-zinc-700">
              <AvatarFallback>
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="bg-zinc-600 rounded-2xl p-4 max-w-[80%] border border-orange-700">
              <p className="text-sm text-white">
                Machine learning is a branch of artificial intelligence that enables computers to learn from data
                and improve their performance without being explicitly programmed. Think of it like teaching a
                computer to recognize patterns, similar to how humans learn from experience. Would you like me to
                explain more about specific types of machine learning?
              </p>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-zinc-800">
          <div className="relative">
            <Input
              placeholder="Type your message..."
              className="bg-zinc-800/50 border-zinc-700 pr-12 text-zinc-100 
              h-11
              placeholder:text-zinc-400 rounded"
            />
            <Button
              size="icon"
              className="absolute right-2 top-1 h-8 w-8 bg-gradient-to-r from-red-500 to-orange-500 hover:opacity-90 rounded"
            >
              <Send className="h-4 w-4 " />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}