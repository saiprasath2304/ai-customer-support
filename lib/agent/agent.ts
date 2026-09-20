import Groq from "groq-sdk";
import { toolSchemas, runTool } from "@/lib/tools";
import { refundPolicyText } from "@/data/refundPolicy";
import { addLog } from "@/lib/logger";
import { ChatMessage } from "@/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const MAX_ITERATIONS = 6; // safety cap on the tool-calling loop

const SYSTEM_PROMPT = `You are an AI customer support agent for an e-commerce store. Your job is to help customers with refund requests by strictly following the store's refund policy below.

${refundPolicyText}

Rules for how you operate:
- You have tools to look up customers, look up orders, check refund eligibility, and process refunds. Use them — never guess or assume data you haven't looked up.
- Always call checkRefund before telling a customer whether their refund is approved or denied.
- Only call processRefund if checkRefund confirmed the order is eligible.
- If a refund is denied, clearly explain which policy rule caused the denial, in plain, friendly language. Do not just say "denied" — say why.
- If a customer is flagged for fraud, tell them the request needs to be escalated to a human agent rather than pretending nothing is wrong.
- Keep replies concise, warm, and professional. You're talking to a real customer, not writing documentation.
- Never reveal internal tool names, JSON, or code to the customer — translate everything into plain English.`;

export interface AgentResult {
  reply: string;
  sessionId: string;
}

/**
 * Runs one turn of the agent loop:
 * 1. Send the conversation + tool schemas to Groq.
 * 2. If the model requests tool calls, execute them locally and log each one.
 * 3. Feed tool results back to the model and repeat until it returns a final answer.
 * Every step (user message, tool call, tool result, final reply) is written to the
 * shared logger so the admin dashboard can show real-time reasoning as it happens.
 */
export async function runAgent(
  sessionId: string,
  customerId: string,
  history: ChatMessage[]
): Promise<AgentResult> {
  const lastUserMessage = history[history.length - 1];

  addLog({
    sessionId,
    type: "user_message",
    label: "Customer message",
    detail: { customerId, content: lastUserMessage?.content },
  });

  const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: `${SYSTEM_PROMPT}\n\nThe customer you are talking to has customerId "${customerId}".` },
    ...history.map((m) => ({
      role: m.role,
      content: m.content,
    })) as Groq.Chat.Completions.ChatCompletionMessageParam[],
  ];

  let finalText = "";

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    let completion;
    try {
      completion = await groq.chat.completions.create({
        model: MODEL,
        messages,
        tools: toolSchemas,
        tool_choice: "auto",
        temperature: 0.3,
      });
    } catch (err) {
      addLog({
        sessionId,
        type: "error",
        label: "Groq API call failed",
        detail: { message: err instanceof Error ? err.message : String(err), iteration },
      });
      finalText =
        "Sorry, I ran into a problem reaching the reasoning engine just now. Please try again in a moment.";
      break;
    }

    const choice = completion.choices[0];
    const responseMessage = choice.message;
    const toolCalls = responseMessage.tool_calls;

    if (!toolCalls || toolCalls.length === 0) {
      // Model gave a final answer — no more tools to call.
      finalText = responseMessage.content || "";
      addLog({
        sessionId,
        type: "agent_message",
        label: "Agent final reply",
        detail: { content: finalText },
      });
      break;
    }

    // Append the assistant's tool-call request to the conversation, then
    // execute each requested tool and append its result.
    messages.push(responseMessage as Groq.Chat.Completions.ChatCompletionMessageParam);

    for (const call of toolCalls) {
      const toolName = call.function.name;
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(call.function.arguments || "{}");
      } catch {
        args = {};
      }

      addLog({ sessionId, type: "tool_call", label: toolName, detail: { args } });

      let result: unknown;
      try {
        result = runTool(toolName, args);
      } catch (err) {
        result = { error: err instanceof Error ? err.message : String(err) };
        addLog({
          sessionId,
          type: "error",
          label: `${toolName} threw an error`,
          detail: { error: result },
        });
      }

      addLog({ sessionId, type: "tool_result", label: toolName, detail: { result } });

      // Surface the refund decision explicitly for the admin dashboard.
      if (toolName === "checkRefund" && result && typeof result === "object" && "eligible" in result) {
        const r = result as { eligible: boolean; reasons: string[]; orderId?: string };
        addLog({
          sessionId,
          type: "decision",
          label: r.eligible ? "REFUND APPROVED" : "REFUND DENIED",
          detail: { orderId: r.orderId, reasons: r.reasons },
        });
      }

      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(result),
      });
    }
    // loop continues: send tool results back to the model
  }

  if (!finalText) {
    finalText =
      "I wasn't able to finish processing that request within my reasoning budget. Could you rephrase, or ask again?";
    addLog({ sessionId, type: "error", label: "Max iterations reached", detail: { MAX_ITERATIONS } });
  }

  return { reply: finalText, sessionId };
}
