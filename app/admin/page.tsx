import { AgentLogs } from "@/components/admin/AgentLogs";
import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="mx-auto flex h-screen max-w-5xl flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Agent Dashboard</h1>
        <Link href="/" className="text-xs text-indigo-600 underline underline-offset-2">
          ← Back to chat
        </Link>
      </div>
      <div className="min-h-0 flex-1">
        <AgentLogs />
      </div>
    </main>
  );
}
