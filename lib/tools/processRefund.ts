import { orders } from "@/data/orders";
import { checkRefund } from "./checkRefund";

/**
 * Only actually mutates the mock order store if checkRefund confirms eligibility.
 * This double-checks policy at the point of action, so the agent can never
 * process a refund purely because the LLM "said so" in a tool call.
 */
export function processRefund(args: { orderId: string }) {
  const verdict = checkRefund({ orderId: args.orderId });

  if (!verdict.eligible) {
    return {
      processed: false,
      orderId: args.orderId,
      reasons: verdict.reasons,
      message: "Refund denied by policy check — not processed.",
    };
  }

  const order = orders.find((o) => o.id === args.orderId);
  if (!order) {
    return { processed: false, orderId: args.orderId, reasons: ["Order not found."] };
  }

  order.refundStatus = "refunded";

  return {
    processed: true,
    orderId: order.id,
    amount: order.amount,
    message: `Refund of $${order.amount.toFixed(2)} processed for order ${order.id}.`,
  };
}
