import { Customer } from "@/types";

// 15 mock customer profiles for the CRM.
// Customer "cust013" is flagged for fraud — use it to demo a policy-violation denial.
export const customers: Customer[] = [
  { id: "cust001", name: "Rahul Mehta", email: "rahul.mehta@example.com", tier: "gold", joinDate: "2022-03-14", flaggedForFraud: false, totalRefundsThisYear: 1 },
  { id: "cust002", name: "Ananya Iyer", email: "ananya.iyer@example.com", tier: "standard", joinDate: "2023-07-02", flaggedForFraud: false, totalRefundsThisYear: 0 },
  { id: "cust003", name: "Vikram Singh", email: "vikram.singh@example.com", tier: "platinum", joinDate: "2020-11-19", flaggedForFraud: false, totalRefundsThisYear: 2 },
  { id: "cust004", name: "Priya Nair", email: "priya.nair@example.com", tier: "standard", joinDate: "2024-01-08", flaggedForFraud: false, totalRefundsThisYear: 0 },
  { id: "cust005", name: "Arjun Kapoor", email: "arjun.kapoor@example.com", tier: "gold", joinDate: "2021-05-27", flaggedForFraud: false, totalRefundsThisYear: 1 },
  { id: "cust006", name: "Sneha Reddy", email: "sneha.reddy@example.com", tier: "standard", joinDate: "2023-09-30", flaggedForFraud: false, totalRefundsThisYear: 0 },
  { id: "cust007", name: "Karan Malhotra", email: "karan.malhotra@example.com", tier: "gold", joinDate: "2022-08-11", flaggedForFraud: false, totalRefundsThisYear: 0 },
  { id: "cust008", name: "Divya Menon", email: "divya.menon@example.com", tier: "standard", joinDate: "2024-04-22", flaggedForFraud: false, totalRefundsThisYear: 1 },
  { id: "cust009", name: "Aditya Verma", email: "aditya.verma@example.com", tier: "platinum", joinDate: "2019-12-03", flaggedForFraud: false, totalRefundsThisYear: 3 },
  { id: "cust010", name: "Meera Pillai", email: "meera.pillai@example.com", tier: "standard", joinDate: "2023-02-17", flaggedForFraud: false, totalRefundsThisYear: 0 },
  { id: "cust011", name: "Rohan Desai", email: "rohan.desai@example.com", tier: "gold", joinDate: "2021-10-05", flaggedForFraud: false, totalRefundsThisYear: 1 },
  { id: "cust012", name: "Ishita Bose", email: "ishita.bose@example.com", tier: "standard", joinDate: "2024-06-14", flaggedForFraud: false, totalRefundsThisYear: 0 },
  { id: "cust013", name: "Sameer Khan", email: "sameer.khan@example.com", tier: "standard", joinDate: "2024-08-01", flaggedForFraud: true, totalRefundsThisYear: 5 },
  { id: "cust014", name: "Tanvi Joshi", email: "tanvi.joshi@example.com", tier: "gold", joinDate: "2022-01-29", flaggedForFraud: false, totalRefundsThisYear: 0 },
  { id: "cust015", name: "Nikhil Rao", email: "nikhil.rao@example.com", tier: "platinum", joinDate: "2020-06-08", flaggedForFraud: false, totalRefundsThisYear: 1 },
];

export function findCustomerById(id: string): Customer | undefined {
  return customers.find((c) => c.id.toLowerCase() === id.toLowerCase());
}
