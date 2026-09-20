import { getCustomer } from "./getCustomer";
import { getOrder } from "./getOrder";
import { checkRefund } from "./checkRefund";
import { processRefund } from "./processRefund";

// OpenAI-compatible tool schemas — Groq's chat completions API uses the same
// `tools` / `tool_calls` shape as OpenAI function calling.
export const toolSchemas = [
  {
    type: "function" as const,
    function: {
      name: "getCustomer",
      description: "Look up a customer's CRM profile by their customer ID.",
      parameters: {
        type: "object",
        properties: {
          customerId: { type: "string", description: "The customer's ID, e.g. 'cust001'." },
        },
        required: ["customerId"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "getOrder",
      description:
        "Look up an order by its order ID, or list all orders belonging to a customer ID.",
      parameters: {
        type: "object",
        properties: {
          orderId: { type: "string", description: "The order ID, e.g. 'ORD001'." },
          customerId: { type: "string", description: "The customer ID, to list all of their orders." },
        },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "checkRefund",
      description:
        "Evaluate an order against the strict refund policy. Returns whether it is eligible and, if not, the exact policy rules that were violated. Always call this before approving or denying a refund.",
      parameters: {
        type: "object",
        properties: {
          orderId: { type: "string", description: "The order ID to evaluate, e.g. 'ORD001'." },
        },
        required: ["orderId"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "processRefund",
      description:
        "Actually process (execute) a refund for an order. Only call this after checkRefund has confirmed the order is eligible. This tool re-validates eligibility itself and will refuse to process an ineligible refund.",
      parameters: {
        type: "object",
        properties: {
          orderId: { type: "string", description: "The order ID to refund, e.g. 'ORD001'." },
        },
        required: ["orderId"],
      },
    },
  },
];

type ToolArgs = Record<string, unknown>;

export function runTool(name: string, args: ToolArgs): unknown {
  switch (name) {
    case "getCustomer":
      return getCustomer(args as { customerId: string });
    case "getOrder":
      return getOrder(args as { orderId?: string; customerId?: string });
    case "checkRefund":
      return checkRefund(args as { orderId: string });
    case "processRefund":
      return processRefund(args as { orderId: string });
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
