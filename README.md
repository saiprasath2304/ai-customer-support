# AI Customer Support Agent — Refund Processing

A Next.js app where an LLM-backed agent handles e-commerce refund requests: it looks up
the customer and order, checks a strict refund policy, and approves or denies the
refund — with every reasoning step visible live on an admin dashboard.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **shadcn/ui** + Tailwind for the UI
- **Groq** (`llama-3.3-70b-versatile`) for the LLM, via raw OpenAI-style function calling
- Mock in-memory CRM data — no database required

## Architecture

```
Customer chat (/)  ──POST /api/chat──▶  agent loop (src/lib/agent/agent.ts)
                                              │
                                              ├─▶ calls Groq with tool schemas
                                              ├─▶ executes requested tools locally
                                              │      (getCustomer, getOrder,
                                              │       checkRefund, processRefund)
                                              ├─▶ logs every step (src/lib/logger.ts)
                                              └─▶ feeds tool results back to Groq,
                                                  loops until a final answer

Admin dashboard (/admin) ──GET /api/logs (SSE)──▶ live stream of the log above
```

**Agent loop** (`src/lib/agent/agent.ts`): a plain ReAct-style loop, no framework.
Each turn: send the conversation + tool schemas to Groq → if it requests tool calls,
run them and append results → repeat (capped at 6 iterations) until Groq returns a
plain text answer.

**Policy enforcement is not left to the LLM.** `checkRefund` (`src/lib/tools/checkRefund.ts`)
mechanically evaluates every rule in the policy (delivery status, 30-day window, final-sale
flag, one-refund-per-order, fraud flag) and returns `eligible` + the exact `reasons` for
denial. `processRefund` re-runs this check itself before mutating any data, so the agent
can never process a refund just because the model "decided" to — the policy check is the
actual gate, not a suggestion to the model.

**Real-time reasoning log**: every tool call, tool result, and decision is pushed to an
in-memory store (`src/lib/logger.ts`) and streamed to `/admin` over Server-Sent Events
(`src/app/api/logs/route.ts`). No polling, no extra infra.

## Setup

1. Copy `.env.local.example` to `.env.local` and add your Groq API key (free at
   https://console.groq.com/keys).
2. Install dependencies:
   ```bash
   npm install groq-sdk lucide-react
   npx shadcn@latest add select
   ```
   (`button`, `card`, `input`, `textarea` should already be installed from setup.)
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Customer chat: http://localhost:3000
   Admin dashboard: http://localhost:3000/admin (open in a second tab/window to watch
   reasoning stream in live as you chat)

## Demoing the two required scenarios

Pick a customer from the dropdown on the chat page, then:

- **Standard approval**: as Rahul Mehta (`cust001`), ask *"I'd like a refund for order
  ORD001"*. It's delivered, within the 30-day window, not final sale → approved.
- **Policy-violation denial**: same customer, ask about **ORD002** (final sale item) or
  switch to Sameer Khan (`cust013`) and ask about **ORD017** (flagged account) — both
  get denied, with the specific policy rule stated back to the customer.

Other edge cases baked into the mock data if you want more to show: **ORD003** (outside
the refund window), **ORD009** (already refunded), **ORD014** (not yet delivered),
**ORD020** (cancelled order).

## Project structure

```
src/
├── app/
│   ├── page.tsx                # Customer chat page
│   ├── admin/page.tsx           # Admin dashboard page
│   └── api/
│       ├── chat/route.ts        # POST — runs the agent loop
│       └── logs/route.ts        # GET  — SSE stream of reasoning logs
├── components/
│   ├── chat/                    # ChatWindow, ChatMessage, ChatInput
│   └── admin/AgentLogs.tsx      # Live log feed + decision summary
├── lib/
│   ├── agent/agent.ts           # The tool-calling loop
│   ├── logger.ts                # In-memory pub/sub log store
│   └── tools/                   # getCustomer, getOrder, checkRefund, processRefund
├── data/
│   ├── customers.ts             # 15 mock customer profiles
│   ├── orders.ts                # Mock orders (dates computed relative to today)
│   └── refundPolicy.ts          # The strict refund policy (text + rules)
└── types/index.ts               # Shared types
```

## Known limitations (by design, for a mock assignment)

- Data is in-memory and resets on server restart — no persistence layer.
- The log store is single-process; fine for local dev/demo, would move to
  Redis pub/sub or a DB for production/multi-instance deployment.
- Voice pipeline (bonus) not implemented in this pass.
