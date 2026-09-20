import { Order } from "@/types";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

// Dates are generated relative to "today" (at server start) so the refund
// window logic in checkRefund.ts always behaves predictably during a demo,
// regardless of what day you record it.
export const orders: Order[] = [
  // ORD001 — clean approve case: delivered 10 days ago, well within the 30-day window, not final sale.
  { id: "ORD001", customerId: "cust001", product: "Wireless Headphones", category: "electronics", amount: 79.99, orderDate: daysAgo(14), deliveryDate: daysAgo(10), status: "delivered", finalSale: false, refundStatus: "none" },

  // ORD002 — edge case: final sale item, denied regardless of window.
  { id: "ORD002", customerId: "cust001", product: "Clearance Running Shoes", category: "apparel", amount: 34.5, orderDate: daysAgo(20), deliveryDate: daysAgo(16), status: "delivered", finalSale: true, refundStatus: "none" },

  // ORD003 — edge case: outside the 30-day refund window.
  { id: "ORD003", customerId: "cust002", product: "Blender", category: "home", amount: 45.0, orderDate: daysAgo(60), deliveryDate: daysAgo(55), status: "delivered", finalSale: false, refundStatus: "none" },

  { id: "ORD004", customerId: "cust002", product: "Yoga Mat", category: "apparel", amount: 22.0, orderDate: daysAgo(5), deliveryDate: daysAgo(2), status: "delivered", finalSale: false, refundStatus: "none" },
  { id: "ORD005", customerId: "cust003", product: "4K Monitor", category: "electronics", amount: 289.99, orderDate: daysAgo(12), deliveryDate: daysAgo(8), status: "delivered", finalSale: false, refundStatus: "none" },
  { id: "ORD006", customerId: "cust003", product: "Face Serum", category: "beauty", amount: 18.75, orderDate: daysAgo(3), deliveryDate: null, status: "shipped", finalSale: false, refundStatus: "none" },
  { id: "ORD007", customerId: "cust004", product: "Coffee Maker", category: "home", amount: 59.99, orderDate: daysAgo(9), deliveryDate: daysAgo(6), status: "delivered", finalSale: false, refundStatus: "none" },
  { id: "ORD008", customerId: "cust005", product: "Bluetooth Speaker", category: "electronics", amount: 49.0, orderDate: daysAgo(40), deliveryDate: daysAgo(35), status: "delivered", finalSale: false, refundStatus: "none" },

  // ORD009 — edge case: order already refunded once, cannot be refunded again.
  { id: "ORD009", customerId: "cust005", product: "Desk Lamp", category: "home", amount: 27.3, orderDate: daysAgo(25), deliveryDate: daysAgo(21), status: "delivered", finalSale: false, refundStatus: "refunded" },

  { id: "ORD010", customerId: "cust006", product: "Organic Snack Box", category: "grocery", amount: 15.0, orderDate: daysAgo(2), deliveryDate: daysAgo(1), status: "delivered", finalSale: false, refundStatus: "none" },
  { id: "ORD011", customerId: "cust007", product: "Mechanical Keyboard", category: "electronics", amount: 89.0, orderDate: daysAgo(18), deliveryDate: daysAgo(14), status: "delivered", finalSale: false, refundStatus: "none" },
  { id: "ORD012", customerId: "cust008", product: "Denim Jacket", category: "apparel", amount: 64.99, orderDate: daysAgo(7), deliveryDate: daysAgo(4), status: "delivered", finalSale: false, refundStatus: "none" },
  { id: "ORD013", customerId: "cust009", product: "Air Fryer", category: "home", amount: 74.0, orderDate: daysAgo(16), deliveryDate: daysAgo(12), status: "delivered", finalSale: false, refundStatus: "none" },

  // ORD014 — edge case: order not yet delivered (in transit), too early to refund.
  { id: "ORD014", customerId: "cust010", product: "Smartwatch", category: "electronics", amount: 129.0, orderDate: daysAgo(2), deliveryDate: null, status: "processing", finalSale: false, refundStatus: "none" },

  { id: "ORD015", customerId: "cust011", product: "Lipstick Set", category: "beauty", amount: 21.5, orderDate: daysAgo(11), deliveryDate: daysAgo(7), status: "delivered", finalSale: false, refundStatus: "none" },
  { id: "ORD016", customerId: "cust012", product: "Throw Pillow Set", category: "home", amount: 32.0, orderDate: daysAgo(6), deliveryDate: daysAgo(3), status: "delivered", finalSale: false, refundStatus: "none" },

  // ORD017 — edge case: flagged/fraud customer, denied regardless of other factors.
  { id: "ORD017", customerId: "cust013", product: "Gaming Mouse", category: "electronics", amount: 39.99, orderDate: daysAgo(9), deliveryDate: daysAgo(5), status: "delivered", finalSale: false, refundStatus: "none" },

  { id: "ORD018", customerId: "cust014", product: "Notebook Set", category: "home", amount: 12.99, orderDate: daysAgo(4), deliveryDate: daysAgo(1), status: "delivered", finalSale: false, refundStatus: "none" },
  { id: "ORD019", customerId: "cust015", product: "Electric Toothbrush", category: "beauty", amount: 44.0, orderDate: daysAgo(13), deliveryDate: daysAgo(9), status: "delivered", finalSale: false, refundStatus: "none" },

  // ORD020 — edge case: order was cancelled, nothing to refund.
  { id: "ORD020", customerId: "cust004", product: "Table Lamp", category: "home", amount: 29.0, orderDate: daysAgo(3), deliveryDate: null, status: "cancelled", finalSale: false, refundStatus: "none" },
];

export function findOrderById(id: string): Order | undefined {
  return orders.find((o) => o.id.toLowerCase() === id.toLowerCase());
}

export function findOrdersByCustomerId(customerId: string): Order[] {
  return orders.filter((o) => o.customerId.toLowerCase() === customerId.toLowerCase());
}
