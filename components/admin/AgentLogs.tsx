"use client";

import { useEffect, useRef, useState } from "react";
import { AgentLog } from "@/types";
import { cn } from "@/lib/utils";

const TOOL_SEQUENCE = ["getCustomer", "getOrder", "checkRefund", "processRefund"];

const TYPE_COLOR: Record<AgentLog["type"], string> = {
  user_message: "text-slate-500",
  agent_message: "text-indigo-600",
  tool_call: "text-amber-600",
  tool_result: "text-emerald-600",
  decision: "text-white",
  error: "text-red-600",
  info: "text-slate-400",
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour12: false });
}

export function AgentLogs() {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [connected, setConnected] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const source = new EventSource("/api/logs");

    source.addEventListener("open", () => setConnected(true));
    source.addEventListener("error", () => setConnected(false));

    source.addEventListener("snapshot", (e: MessageEvent) => {
      setLogs(JSON.parse(e.data));
    });

    source.addEventListener("log", (e: MessageEvent) => {
      const entry: AgentLog = JSON.parse(e.data);
      setLogs((prev) => [...prev, entry]);
    });

    return () => source.close();
  }, []);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [logs]);

  // Derive state for the "current session" summary panel from the most recent session's logs.
  const latestSessionId = logs.length > 0 ? logs[logs.length - 1].sessionId : null;
  const sessionLogs = latestSessionId ? logs.filter((l) => l.sessionId === latestSessionId) : [];
  const calledTools = new Set(sessionLogs.filter((l) => l.type === "tool_result").map((l) => l.label));
  const latestDecision = [...sessionLogs].reverse().find((l) => l.type === "decision");

  return (
    <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
      {/* Summary panel */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              connected ? "bg-emerald-500" : "bg-slate-300"
            )}
          />
          <span className="text-sm font-medium text-slate-900">
            {connected ? "Agent Active" : "Connecting..."}
          </span>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            Tool calls (latest session)
          </p>
          <ul className="space-y-1.5">
            {TOOL_SEQUENCE.map((tool) => (
              <li key={tool} className="flex items-center justify-between text-sm">
                <span className="font-mono text-slate-700">{tool}</span>
                <span className={calledTools.has(tool) ? "text-emerald-600" : "text-slate-300"}>
                  {calledTools.has(tool) ? "✓" : "—"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Decision</p>
          {latestDecision ? (
            <div
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-semibold",
                latestDecision.label === "REFUND APPROVED"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-red-100 text-red-800"
              )}
            >
              {latestDecision.label}
              {typeof latestDecision.detail === "object" &&
                latestDecision.detail !== null &&
                "reasons" in latestDecision.detail &&
                Array.isArray((latestDecision.detail as { reasons: string[] }).reasons) &&
                (latestDecision.detail as { reasons: string[] }).reasons.length > 0 && (
                  <ul className="mt-1.5 list-inside list-disc text-xs font-normal opacity-90">
                    {(latestDecision.detail as { reasons: string[] }).reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No decision yet</p>
          )}
        </div>
      </div>

      {/* Live log feed */}
      <div
        ref={feedRef}
        className="overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed"
      >
        {logs.length === 0 && <p className="text-slate-500">Waiting for agent activity...</p>}
        {logs.map((log) => (
          <div key={log.id} className="mb-1.5 flex gap-2">
            <span className="shrink-0 text-slate-600">{formatTime(log.timestamp)}</span>
            <span
              className={cn(
                "shrink-0",
                log.type === "decision"
                  ? log.label === "REFUND APPROVED"
                    ? "bg-emerald-600 px-1.5 rounded text-white"
                    : "bg-red-600 px-1.5 rounded text-white"
                  : TYPE_COLOR[log.type]
              )}
            >
              [{log.type}]
            </span>
            <span className="text-slate-300">{log.label}</span>
            {log.detail !== undefined && (
              <span className="truncate text-slate-500">{JSON.stringify(log.detail)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
