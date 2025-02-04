// src/app/api/chat/route.ts
import { NextRequest } from 'next/server';
import { HumanMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { AgentKit, CdpWalletProvider } from "@coinbase/agentkit";
import {
  wethActionProvider,
  walletActionProvider,
  erc20ActionProvider,
  cdpApiActionProvider,
  cdpWalletActionProvider,
  pythActionProvider,
  basenameActionProvider,
} from "@coinbase/agentkit";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

// Initialize the agent
async function initializeAgent() {
  const llm = new ChatOpenAI({
    model: "gpt-4-0125-preview",
  });

  const config = {
    apiKeyName: process.env.CDP_API_KEY_NAME,
    apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    networkId: process.env.NETWORK_ID || "base-sepolia",
  };

  const walletProvider = await CdpWalletProvider.configureWithWallet(config);

  const agentKit = await AgentKit.from({
    walletProvider,
    actionProviders: [
      wethActionProvider(),
      pythActionProvider(),
      walletActionProvider(),
      erc20ActionProvider(),
      basenameActionProvider(),
      cdpApiActionProvider({
        apiKeyName: process.env.CDP_API_KEY_NAME,
        apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
      cdpWalletActionProvider({
        apiKeyName: process.env.CDP_API_KEY_NAME,
        apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    ],
  });

  const tools = await getLangChainTools(agentKit);
  const memory = new MemorySaver();

  return createReactAgent({
    llm,
    tools,
    checkpointSaver: memory,
    messageModifier: `
      You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit.
      Be concise and helpful with your responses.
    `,
  });
}

// src/app/api/chat/route.ts
export async function POST(req: NextRequest) {
    try {
      const { message } = await req.json();
      
      const agent = await initializeAgent();
      
      const agentStream = await agent.stream(
        { messages: [new HumanMessage(message)] },
        { configurable: { thread_id: "SYNX" } }
      );
  
      const encoder = new TextEncoder();
      const stream = new TransformStream();
      const writer = stream.writable.getWriter();
  
      let accumulatedContent = '';
      let isFirstChunk = true;
  
      (async () => {
        try {
          for await (const chunk of agentStream) {
            if ("agent" in chunk) {
              const content = chunk.agent.messages[0].content;
              
              // Send only new content increments
              if (content.startsWith(accumulatedContent)) {
                const delta = content.slice(accumulatedContent.length);
                if (delta) {
                  await writer.write(encoder.encode(`data: ${JSON.stringify(delta)}\n\n`));
                  accumulatedContent = content;
                }
              } else {
                // Handle case where content doesn't continue previous state
                await writer.write(encoder.encode(`data: ${JSON.stringify(content)}\n\n`));
                accumulatedContent = content;
              }
              
              // Reset first chunk flag after initial content
              if (isFirstChunk && content) isFirstChunk = false;
            }
          }
        } finally {
          await writer.close();
        }
      })();
  
      return new Response(stream.readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }