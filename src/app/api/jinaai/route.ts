import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) throw new Error('Missing URL');

    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          let counter = 0;
          const sendUpdate = () => {
            const chunk = { type: 'update', message: `Processing... ${counter}%` };
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
          };

          // Start sending updates
          const intervalId = setInterval(() => {
            counter += 10;
            if (counter <= 90) sendUpdate();
          }, 1000);

          // Call JinaAI
          const response = await fetch(`https://r.jina.ai/${url}`, {
            headers: {
              "X-Return-Format": "markdown",
              Authorization: `Bearer ${process.env.JINA_API_KEY}`,
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const readerResponse = await response.text();

          console.log(readerResponse);

          // Stop sending updates
          clearInterval(intervalId);

          // Send final update
          const finalChunk = { type: 'result', message: readerResponse };
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalChunk)}\n\n`));

          // Signal the end of the stream
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Error in stream processing:', error);
          controller.error(error);
        }
      },
      cancel() {
        console.log('Stream cancelled by the client');
      }
    });

    return new Response(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}