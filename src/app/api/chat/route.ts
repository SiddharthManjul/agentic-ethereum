// src/app/api/chat/route.ts
import { NextRequest } from 'next/server';
import { HumanMessage } from '@langchain/core/messages';
import { initializeAgent } from '@/Providers/agentProvider';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, userId } = body;
    
    if (!userId) {
      throw new Error("userId is required");
    }

    const agent = await initializeAgent({ userId });
    const agentStream = await agent.stream(
      { messages: [new HumanMessage(message)] },
      { configurable: { thread_id: "SYNX" } }
    );

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    (async () => {
      try {
        for await (const chunk of agentStream) {
          if ("agent" in chunk) {
            let content = chunk.agent.messages[0].content;
            
            try {
              // Try to parse as JSON first
              content = JSON.parse(content);
            } catch (e) {
              // Only remove quotes for non-JSON content
              content = content.replace(/^"|"$/g, '');
            }
            await writer.write(encoder.encode(`data: ${JSON.stringify(content)}\n\n`));
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
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error processing request:', { error: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}