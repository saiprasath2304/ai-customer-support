import { NextRequest } from "next/server";
import { getLogs, subscribe } from "@/lib/logger";
import { AgentLog } from "@/types";

export const dynamic = "force-dynamic"; // never cache an SSE stream

function sseFormat(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send everything logged so far, so a freshly opened dashboard isn't empty.
      controller.enqueue(encoder.encode(sseFormat("snapshot", getLogs())));

      const unsubscribe = subscribe((entry: AgentLog) => {
        try {
          controller.enqueue(encoder.encode(sseFormat("log", entry)));
        } catch {
          // controller already closed
        }
      });

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 15000);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
