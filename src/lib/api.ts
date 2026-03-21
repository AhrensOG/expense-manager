const API_BASE = '/api';

interface Expense {
  amount: number;
  description?: string;
  date: string;
  currencyId?: number;
  categoryId?: number;
  accountId?: number;
  tripId?: number;
}

interface Income {
  amount: number;
  description?: string;
  date: string;
  currencyId?: number;
  categoryId?: number;
  accountId?: number;
}

interface Category {
  name: string;
  type: string;
  icon?: string;
  color?: string;
}

interface Account {
  name: string;
  type: string;
  balance?: number;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface Transfer {
  amount: number;
  description?: string;
  date: string;
  currencyId?: number;
  fromAccountId: number;
  toAccountId: number;
}

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return response;
};

export const api = {
  // Expenses
  async getExpenses(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetchWithAuth(`${API_BASE}/expenses${query ? `?${query}` : ''}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error fetching expenses');
    return data.expenses || [];
  },

  async createExpense(expense: Expense) {
    const res = await fetchWithAuth(`${API_BASE}/expenses`, {
      method: 'POST',
      body: JSON.stringify(expense),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error creating expense');
    return data.expense;
  },

  async updateExpense(id: number, expense: Expense) {
    const res = await fetchWithAuth(`${API_BASE}/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expense),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error updating expense');
    return data.expense;
  },

  async deleteExpense(id: number) {
    const res = await fetchWithAuth(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error deleting expense');
    return data;
  },

  // Incomes
  async getIncomes(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetchWithAuth(`${API_BASE}/incomes${query ? `?${query}` : ''}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error fetching incomes');
    return data.incomes || [];
  },

  async createIncome(income: Income) {
    const res = await fetchWithAuth(`${API_BASE}/incomes`, {
      method: 'POST',
      body: JSON.stringify(income),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error creating income');
    return data.income;
  },

  async updateIncome(id: number, income: Income) {
    const res = await fetchWithAuth(`${API_BASE}/incomes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(income),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error updating income');
    return data.income;
  },

  async deleteIncome(id: number) {
    const res = await fetchWithAuth(`${API_BASE}/incomes/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error deleting income');
    return data;
  },

  // Categories
  async getCategories() {
    const res = await fetchWithAuth(`${API_BASE}/categories`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error fetching categories');
    return data.categories || [];
  },

  async createCategory(category: Category) {
    const res = await fetchWithAuth(`${API_BASE}/categories`, {
      method: 'POST',
      body: JSON.stringify(category),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error creating category');
    return data.category;
  },

  async deleteCategory(id: number) {
    const res = await fetchWithAuth(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error deleting category');
    return data;
  },

  // Accounts
  async getAccounts() {
    const res = await fetchWithAuth(`${API_BASE}/accounts`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error fetching accounts');
    return data.accounts || [];
  },

  async createAccount(account: Account) {
    const res = await fetchWithAuth(`${API_BASE}/accounts`, {
      method: 'POST',
      body: JSON.stringify(account),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error creating account');
    return data.account;
  },

  async updateAccount(id: number, data: Partial<Account>) {
    const res = await fetchWithAuth(`${API_BASE}/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Error updating account');
    return result.account;
  },

  async deleteAccount(id: number) {
    const res = await fetchWithAuth(`${API_BASE}/accounts/${id}`, {
      method: 'DELETE',
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Error deleting account');
    return result;
  },

  // Currencies
  async getCurrencies() {
    const res = await fetchWithAuth(`${API_BASE}/currencies`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error fetching currencies');
    return data.currencies || [];
  },

  // Auth
  async register(data: RegisterData) {
    const res = await fetchWithAuth(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Error registering');
    return result;
  },

  // Transfers
  async getTransfers() {
    const res = await fetchWithAuth(`${API_BASE}/transfers`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error fetching transfers');
    return data.transfers || [];
  },

  async createTransfer(transfer: Transfer) {
    const res = await fetchWithAuth(`${API_BASE}/transfers`, {
      method: 'POST',
      body: JSON.stringify(transfer),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error creating transfer');
    return data.transfer;
  },

  async deleteTransfer(id: number) {
    const res = await fetchWithAuth(`${API_BASE}/transfers/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error deleting transfer');
    return data;
  },

  async updateTransfer(id: number, transfer: Partial<Transfer>) {
    const res = await fetchWithAuth(`${API_BASE}/transfers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transfer),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error updating transfer');
    return data.transfer;
  },
};

export default api;
