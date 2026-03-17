export interface TransactionFilters {
  type: 'income' | 'expense' | 'transfer' | null;
  categoryId: number | null;
  accountId: number | null;
  month: number | null;
}

export interface TransactionGroup {
  date: string;
  transactions: Array<{
    id: number;
    type: string;
    amount: number;
    categoryId?: number;
    accountId?: number;
    date: string;
    Category?: {
      name: string;
      icon: string;
    };
  }>;
}

export interface TransactionTotals {
  income: number;
  expenses: number;
  balance: number;
}
