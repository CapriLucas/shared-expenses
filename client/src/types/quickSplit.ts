export interface QuickSplitPerson {
  id: string; // Generated locally
  name: string;
}

export interface QuickSplitPayment {
  id: string; // Generated locally
  amount: number;
  description: string;
  payer: QuickSplitPerson;
  splitWith: QuickSplitPerson[]; // People to split with (can be all)
}

export interface Settlement {
  from: QuickSplitPerson;
  to: QuickSplitPerson;
  amount: number;
}
