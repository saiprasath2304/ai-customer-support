import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/lib/agent/agent";
import { ChatMessage } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, customerId, messages } = body as {
      sessionId: string;
      customerId: string;
      messages: ChatMessage[];
    };

    if (!sessionId || !customerId || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "sessionId, customerId, and a non-empty messages array are required." },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not set on the server. Add it to .env.local and restart the dev server." },
        { status: 500 }
      );
    }

    const result = await runAgent(sessionId, customerId, messages);
    return NextResponse.json(result);
  } catch (err) {
    console.error("POST /api/chat failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown server error" },
      { status: 500 }
    );
  }
}
