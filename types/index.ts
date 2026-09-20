// Shared types for the AI Customer Support Agent

export interface Customer {
  id: string;
  name: string;
  email: string;
  tier: "standard" | "gold" | "platinum";
  joinDate: string; // ISO date
  flaggedForFraud: boolean; // used for the policy-violation edge case demo
  totalRefundsThisYear: number;
}

export interface Order {
  id: string;
  customerId: string;
  product: string;
  category: "electronics" | "apparel" | "home" | "beauty" | "grocery";
  amount: number; // in USD
  orderDate: string; // ISO date
  deliveryDate: string | null; // ISO date, null if not yet delivered
  status: "delivered" | "shipped" | "processing" | "cancelled";
  finalSale: boolean; // final sale items are non-refundable
  refundStatus: "none" | "requested" | "approved" | "denied" | "refunded";
}

export interface RefundPolicyRule {
  id: string;
  label: string;
  description: string;
}

export type LogType =
  | "user_message"
  | "agent_message"
  | "tool_call"
  | "tool_result"
  | "decision"
  | "error"
  | "info";

export interface AgentLog {
  id: string;
  sessionId: string;
  timestamp: string; // ISO datetime
  type: LogType;
  label: string; // short human-readable title, e.g. "getOrder"
  detail?: unknown; // args, result, or message payload
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface RefundDecision {
  orderId: string;
  eligible: boolean;
  reasons: string[];
}
