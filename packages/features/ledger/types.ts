import type { Attachment, Customer, LedgerTransaction } from "@hisabkit/types";

export interface CustomerMutationPayload {
  name: Customer["name"];
  phone?: Customer["phone"];
  email?: Customer["email"];
  address?: Customer["address"];
  gstNumber?: Customer["gstNumber"];
  dueDate?: Customer["dueDate"];
  tags?: Customer["tags"];
}

export interface TransactionMutationPayload {
  customerId: string;
  type: "SALE" | "PAYMENT";
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  description?: string;
  timestamp: string;
}

export interface LedgerFetchResult {
  transactions: LedgerTransaction[];
  attachmentsByTransaction: Record<LedgerTransaction["id"], Attachment[]>;
}
