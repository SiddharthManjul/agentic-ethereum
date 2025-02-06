// src/components/ChatInterface.tsx
"use client";
import { useState, useRef, useEffect } from 'react';
import { SyncLoader } from 'react-spinners';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { BrainCircuit, Send } from 'lucide-react';
import { Card } from './ui/card';
import ReactMarkdown from 'react-markdown';
import { usePrivy } from '@privy-io/react-auth';
import { useParams } from 'next/navigation';


interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatInterface() {
  const { user } = usePrivy();
  const params = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Check if user is authenticated
    if (!user?.id) {
      console.error('User not authenticated');
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          userId: user.id,
          chatId: params?.chatId
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const assistantMessage: Message = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, assistantMessage]);

      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
      
        buffer += decoder.decode(value, { stream: true });
      
        while (buffer.includes('\n\n')) {
          const eventEndIndex = buffer.indexOf('\n\n');
          const eventData = buffer.slice(0, eventEndIndex);
          buffer = buffer.slice(eventEndIndex + 2);
      
          const lines = eventData.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const content = JSON.parse(line.slice(6));
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
      
                  if (lastMessage.role === 'assistant' && lastMessage.content !== content) {
                    lastMessage.content += content;
                  }
                  return newMessages;
                });
              } catch (error) {
                console.error('Error parsing SSE data:', error);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Card className="bg-zinc-950 border border-zinc-800 backdrop-blur-sm h-full flex flex-col">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex items-start gap-3 mx-4 md:mx-6 lg:mx-8 ${message.role === 'user' ? 'justify-end' : ''}`}>
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 bg-gradient-to-r from-red-500 to-orange-500 border border-zinc-700">
                  <AvatarFallback>
                    <BrainCircuit className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div className={`rounded-2xl p-4 max-w-[90%] md:max-w-[70%] border ${
                message.role === 'user' 
                  ? 'bg-zinc-800/80 border-blue-700' 
                  : 'bg-zinc-600 border-orange-700'
              }`}>
                <ReactMarkdown className="text-sm text-white prose-invert">
                  {message.content}
                </ReactMarkdown>
              </div>
              {message.role === 'user' && (
                <Avatar className="h-8 w-8 border border-zinc-700">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 mx-4 md:mx-6 lg:mx-8">
              <Avatar className="h-8 w-8 bg-gradient-to-r from-red-500 to-orange-500 border border-zinc-700">
                <AvatarFallback>
                  <BrainCircuit className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <SyncLoader className='ml-2' color="#f97316" size={6} speedMultiplier={0.6}/>
            </div>        
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="sticky bottom-0 bg-zinc-950/80 backdrop-blur-sm border-t border-zinc-800">
          <form onSubmit={handleSubmit} className="max-w-7xl mx-auto p-4 md:p-6">
            <div className="flex items-center gap-2 w-full">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow p-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white p-3 rounded aspect-square flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:opacity-50"
                disabled={isLoading}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </Card>
  );
}