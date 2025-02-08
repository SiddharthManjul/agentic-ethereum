// Navbar.tsx
import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";
import { useRouter } from "next/navigation";
import { generateChatId } from "../../lib/utils";
import { toast } from "react-hot-toast";
import { useEffect } from "react";


export function Navbar({ 
  homeSectionRef,
  whySectionRef 
}: { 
  homeSectionRef: React.RefObject<HTMLDivElement | null>;
  whySectionRef: React.RefObject<HTMLDivElement | null>;
}) {
  const router = useRouter();
  const { user, authenticated } = usePrivy();

  const handleStartChat = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to start a chat.');
      return;
    }
    
    const chatId = generateChatId();

    try {
      // Create chat in database first
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chatId,
          userId: user.id,
          title: chatId
        })
      });

      if (!response.ok) throw new Error('Failed to create chat');

      // Navigate to new chat after successful creation
      router.push(`/chat/${chatId}`);
      toast.success('Started new chat!');
    } catch (error) {
      toast.error('Failed to create new chat');
      console.error('Error creating chat:', error);
    }
  };

  const scrollToHome = () => {
    if (homeSectionRef.current) {
      homeSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToWhy = () => {
    if (whySectionRef.current) {
      whySectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const { login, ready} = usePrivy();
  const disableLogin = !ready || (ready && authenticated);
  
  useEffect(() => {
    if (authenticated && user?.id) {
      toast.success('Logged in Successfully!', {
        id: 'auth-success',
        duration: 2000
      });

      // Create or upsert the user record in your database
      fetch('/api/createUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          did: user.id, // Privy DID
          email: user?.email?.address || null,
        }),
      })
      .then(response => response.json())
      .then(data => {
        console.log('User record created or updated:', data);
      })
      .catch(err => console.error('Error creating user:', err));
    }
  }, [authenticated, user]);

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
                <div className="text-white font-Teknaf text-xl tracking-wider uppercase font-semibold">S. Y. N. X.</div>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  className="hover:text-white text-gray-300 px-3 py-2 rounded-md text-sm transition-all duration-200"
                  onClick={scrollToWhy}
                >
                  Why
                </button>
                <button className="hover:text-white text-gray-300 px-3 py-2 rounded-md text-sm transition-all duration-200">
                  <a href="https://github.com/Webentia-Labs/agentic-ethereum" target="_blank" rel="noopener noreferrer" className="underline">
                    GitHub
                  </a>
                </button>
                {authenticated ? (
                  <>
                    <span className="text-gray-400 text-sm truncate max-w-[200px]">
                      {user?.email?.address || user?.wallet?.address}
                    </span>
                    <button
                      className="bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-full text-sm border border-white/20 transition-all duration-300"
                      onClick={() => {
                        handleStartChat();
                        toast.success('Joined the Chat!');
                      }}
                    >
                      Chat
                    </button>
                  </>
                ) : (
                  <button
                    className="bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-full text-sm border border-white/20 transition-all duration-300"
                    disabled={disableLogin}
                    onClick={() => {
                      login();
                    }}
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
