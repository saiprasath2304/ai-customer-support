import { findOrderById, findOrdersByCustomerId } from "@/data/orders";

export function getOrder(args: { orderId?: string; customerId?: string }) {
  if (args.orderId) {
    const order = findOrderById(args.orderId);
    if (!order) {
      return { found: false, error: `No order found with id ${args.orderId}` };
    }
    return { found: true, order };
  }
  if (args.customerId) {
    const orders = findOrdersByCustomerId(args.customerId);
    return { found: orders.length > 0, orders };
  }
  return { found: false, error: "Provide either orderId or customerId." };
}
