"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { customers } from "@/data/customers";
import { ChatMessage as ChatMessageType } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

const WELCOME = (name: string): ChatMessageType => ({
  id: makeId(),
  role: "assistant",
  content: `Hi ${name.split(" ")[0]}! I'm your AI support agent. I can help check order status or process a refund — just tell me your order ID and what's going on.`,
  timestamp: new Date().toISOString(),
});

export function ChatWindow() {
  const [customerId, setCustomerId] = useState(customers[0].id);
  const [sessionId, setSessionId] = useState(makeId());
  const [messages, setMessages] = useState<ChatMessageType[]>([WELCOME(customers[0].name)]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  function handleCustomerChange(newId: string) {
    setCustomerId(newId);
    setSessionId(makeId());
    const customer = customers.find((c) => c.id === newId);
    setMessages([WELCOME(customer?.name || "there")]);
    setError(null);
  }

  async function handleSend(text: string) {
    const userMessage: ChatMessageType = {
      id: makeId(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, customerId, messages: nextMessages }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      const assistantMessage: ChatMessageType = {
        id: makeId(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const activeCustomer = customers.find((c) => c.id === customerId);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-slate-900">Customer Support Chat</p>
          <p className="text-xs text-slate-500">Signed in as {activeCustomer?.name}</p>
        </div>
        <Select value={customerId} onValueChange={handleCustomerChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select customer" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} ({c.id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-slate-50 px-4 py-4">
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
              AI
            </span>
            Thinking...
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}
      </div>

      <ChatInput onSend={handleSend} disabled={loading} />
    </div>
  );
}
