import { ChatWindow } from "@/components/chat/ChatWindow";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex h-screen max-w-2xl flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">AI Customer Support</h1>
        <Link href="/admin" className="text-xs text-indigo-600 underline underline-offset-2">
          Admin dashboard →
        </Link>
      </div>
      <div className="min-h-0 flex-1">
        <ChatWindow />
      </div>
    </main>
  );
}
