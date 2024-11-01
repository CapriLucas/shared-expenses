export enum RecurrenceType {
  NONE = "none",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  dueDate: string;
  recurrenceType: RecurrenceType;
  recurrenceEndDate: string | null;
  isPaid: boolean;
  creator: {
    id: number;
    name: string;
    email: string;
    avatarUrl: string;
  };
  payer: {
    id: number;
    name: string;
    email: string;
    avatarUrl: string;
  };
  createdAt: string;
  updatedAt: string;
}
