import type { SseEvent } from '@/types';

type SseClient = {
  id: string;
  controller: ReadableStreamDefaultController;
};

const clients = new Map<string, SseClient>();

export function addSseClient(id: string, controller: ReadableStreamDefaultController): void {
  clients.set(id, { id, controller });
}

export function removeSseClient(id: string): void {
  clients.delete(id);
}

export function broadcastSse(event: SseEvent): void {
  const message = formatSseMessage(event);
  const dead: string[] = [];

  clients.forEach((client) => {
    try {
      client.controller.enqueue(new TextEncoder().encode(message));
    } catch {
      dead.push(client.id);
    }
  });

  dead.forEach(id => clients.delete(id));
}

function formatSseMessage(event: SseEvent): string {
  const data = JSON.stringify({ type: event.type, payload: event.payload ?? null });
  return `event: ${event.type}\ndata: ${data}\n\n`;
}

export function getSseClientCount(): number {
  return clients.size;
}
