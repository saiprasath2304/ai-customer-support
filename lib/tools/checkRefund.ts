import { findOrderById } from "@/data/orders";
import { findCustomerById } from "@/data/customers";
import { REFUND_WINDOW_DAYS } from "@/data/refundPolicy";

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Applies every rule in the strict refund policy to a given order/customer.
 * Returns eligible = true only if ALL rules pass. Always returns the list of
 * rules that were violated (empty if eligible) so the agent — and the admin
 * dashboard — can show exactly why a refund was approved or denied.
 */
export function checkRefund(args: { orderId: string }) {
  const order = findOrderById(args.orderId);
  if (!order) {
    return { eligible: false, reasons: [`Order ${args.orderId} does not exist.`] };
  }

  const customer = findCustomerById(order.customerId);
  const reasons: string[] = [];

  // Rule: fraud flag
  if (customer?.flaggedForFraud) {
    reasons.push(
      "Customer account is flagged for fraud/abuse. Refund must be escalated to a human agent, not auto-approved."
    );
  }

  // Rule: order must be delivered
  if (order.status !== "delivered") {
    reasons.push(`Order status is '${order.status}', not 'delivered'. Nothing to refund yet.`);
  }

  // Rule: final sale items are non-refundable
  if (order.finalSale) {
    reasons.push("Item was marked as final sale / clearance and is non-refundable.");
  }

  // Rule: one refund per order
  if (order.refundStatus === "refunded" || order.refundStatus === "approved") {
    reasons.push(`Order has already been ${order.refundStatus}. Cannot refund the same order twice.`);
  }

  // Rule: 30-day refund window (only meaningful if the order was delivered)
  if (order.status === "delivered" && order.deliveryDate) {
    const daysSinceDelivery = daysBetween(new Date(order.deliveryDate), new Date());
    if (daysSinceDelivery > REFUND_WINDOW_DAYS) {
      reasons.push(
        `Order was delivered ${daysSinceDelivery} days ago, which exceeds the ${REFUND_WINDOW_DAYS}-day refund window.`
      );
    }
  }

  return {
    orderId: order.id,
    eligible: reasons.length === 0,
    reasons,
    order,
  };
}
