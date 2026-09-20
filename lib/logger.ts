import { AgentLog, LogType } from "@/types";

// Simple in-memory store. Good enough for a demo / single-process dev server —
// swap for a real datastore + pub/sub (Redis, Postgres LISTEN/NOTIFY, etc.) in production.
const MAX_LOGS = 500;
let logs: AgentLog[] = [];
const listeners = new Set<(entry: AgentLog) => void>();

function makeId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function addLog(params: {
  sessionId: string;
  type: LogType;
  label: string;
  detail?: unknown;
}): AgentLog {
  const entry: AgentLog = {
    id: makeId(),
    sessionId: params.sessionId,
    timestamp: new Date().toISOString(),
    type: params.type,
    label: params.label,
    detail: params.detail,
  };
  logs.push(entry);
  if (logs.length > MAX_LOGS) logs = logs.slice(logs.length - MAX_LOGS);
  for (const fn of listeners) fn(entry);
  return entry;
}

export function getLogs(): AgentLog[] {
  return logs;
}

export function clearLogs(): void {
  logs = [];
}

export function subscribe(fn: (entry: AgentLog) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
