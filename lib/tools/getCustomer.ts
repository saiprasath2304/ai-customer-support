import { findCustomerById } from "@/data/customers";

export function getCustomer(args: { customerId: string }) {
  const customer = findCustomerById(args.customerId);
  if (!customer) {
    return { found: false, error: `No customer found with id ${args.customerId}` };
  }
  return { found: true, customer };
}
