// src/app/api/chat/route.ts
import { NextRequest } from 'next/server';
import { HumanMessage } from '@langchain/core/messages';
import { initializeAgent } from '@/Providers/agentProvider';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Request Body:', body);
    const { message, userId } = body;
    
    if (!userId) {
      throw new Error("userId is required");
    }

    console.log('Received message:', message);
    const agent = await initializeAgent({ userId });
    
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
            
            if (content.startsWith(accumulatedContent)) {
              const delta = content.slice(accumulatedContent.length);
              if (delta) {
                await writer.write(encoder.encode(`data: ${JSON.stringify(delta)}\n\n`));
                accumulatedContent = content;
              }
            } else {
              await writer.write(encoder.encode(`data: ${JSON.stringify(content)}\n\n`));
              accumulatedContent = content;
            }
            
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
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}