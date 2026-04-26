import { NextRequest } from 'next/server';
import { addSseClient, removeSseClient } from '@/lib/sse';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const clientId = uuidv4();

  const stream = new ReadableStream({
    start(controller) {
      addSseClient(clientId, controller);

      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(': ping\n\n'));
        } catch {
          clearInterval(pingInterval);
        }
      }, 25000);

      request.signal.addEventListener('abort', () => {
        clearInterval(pingInterval);
        removeSseClient(clientId);
        try { controller.close(); } catch { /* ignore */ }
      });
    },
    cancel() {
      removeSseClient(clientId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
