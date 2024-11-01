export interface Payment {
  id: number;
  amount: number;
  paymentDate: string;
  receiptUrl: string;
  isVerified: boolean;
  createdAt: string;
  payer: {
    id: number;
    name: string;
    email: string;
    avatarUrl: string;
  };
}
