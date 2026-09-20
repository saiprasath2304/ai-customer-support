import { RefundPolicyRule } from "@/types";

export const REFUND_WINDOW_DAYS = 30;

export const refundPolicyRules: RefundPolicyRule[] = [
  {
    id: "window",
    label: "30-day refund window",
    description: `Refunds are only valid within ${REFUND_WINDOW_DAYS} days of the delivery date. Orders delivered longer ago than that are not eligible.`,
  },
  {
    id: "delivered",
    label: "Order must be delivered",
    description:
      "Only orders with status 'delivered' can be refunded. Orders that are processing, shipped, or cancelled are not eligible (there is nothing to refund yet, or the order no longer exists).",
  },
  {
    id: "final-sale",
    label: "Final sale items are non-refundable",
    description:
      "Items marked as final sale / clearance are non-refundable under any circumstance, regardless of the refund window.",
  },
  {
    id: "one-refund-per-order",
    label: "One refund per order",
    description:
      "An order that has already been refunded, or is currently marked as approved/refunded, cannot be refunded again.",
  },
  {
    id: "fraud-flag",
    label: "Flagged accounts are denied",
    description:
      "Customers flagged for fraud or abuse on their account are not eligible for refunds and must be escalated to a human agent instead of being auto-processed.",
  },
];

// A plain-text version of the policy, given to the LLM in its system prompt.
export const refundPolicyText = `STRICT REFUND POLICY

${refundPolicyRules.map((r, i) => `${i + 1}. ${r.label}: ${r.description}`).join("\n")}

The agent must never approve a refund that violates any of the rules above.
When a request is denied, always state the specific rule that caused the denial.`;
