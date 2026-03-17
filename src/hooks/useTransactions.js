import { useState, useEffect, useMemo, useCallback } from 'react';
import { transactions as mockTransactions } from '@/data/mockData';
import api from '@/lib/api';

const USE_MOCK = false; // Set to false when API is ready with auth

const transformExpense = (e) => ({
  id: e.id,
  type: 'expense',
  category: e.Category?.name?.toLowerCase() || 'autres',
  categoryId: e.categoryId,
  categoryIcon: e.Category?.icon || 'folder',
  categoryColor: e.Category?.color || '#95A5A6',
  accountId: e.accountId,
  accountName: e.Account?.name || null,
  method: 'banque',
  amount: -parseFloat(e.amount),
  date: e.date,
  description: e.description,
});

const transformIncome = (i) => ({
  id: i.id,
  type: 'income',
  category: i.Category?.name?.toLowerCase() || 'salaire',
  categoryId: i.categoryId,
  categoryIcon: i.Category?.icon || 'folder',
  categoryColor: i.Category?.color || '#2ECC71',
  accountId: i.accountId,
  accountName: i.Account?.name || null,
  method: 'banque',
  amount: parseFloat(i.amount),
  date: i.date,
  description: i.description,
});

const transformTransfer = (t) => ({
  id: t.id,
  type: 'transfer',
  category: 'transfer',
  categoryId: null,
  categoryIcon: 'arrowRightLeft',
  categoryColor: '#8E8E93',
  fromAccountId: t.fromAccountId,
  toAccountId: t.toAccountId,
  fromAccountName: t.fromAccount?.name || null,
  toAccountName: t.toAccount?.name || null,
  method: 'transfer',
  amount: parseFloat(t.amount),
  date: t.date,
  description: t.description,
});

export const useTransactions = (year, month) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    if (!year || !month) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (USE_MOCK) {
        // Use mock data
        const filtered = mockTransactions.filter(tx => {
          const txDate = new Date(tx.date);
          return txDate.getFullYear() === year && txDate.getMonth() + 1 === month;
        });
        setTransactions(filtered);
      } else {
        // Use real API
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = month === 12 
          ? `${year + 1}-01-01`
          : `${year}-${String(month + 1).padStart(2, '0')}-01`;
        
        const [expenses, incomes, transfers] = await Promise.all([
          api.getExpenses({ startDate, endDate }),
          api.getIncomes({ startDate, endDate }),
          api.getTransfers(),
        ]);
        
        // Filter transfers by date range
        const start = new Date(startDate);
        const end = new Date(endDate);
        const filteredTransfers = transfers.filter(t => {
          const txDate = new Date(t.date);
          return txDate >= start && txDate < end;
        });
        
        // Transform to unified format
        const allTx = [
          ...expenses.map(transformExpense),
          ...incomes.map(transformIncome),
          ...filteredTransfers.map(transformTransfer),
        ];
        setTransactions(allTx);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = useCallback(async (txData) => {
    try {
      if (USE_MOCK) {
        // Add to mock
        const newTx = {
          id: Math.max(...mockTransactions.map(t => t.id), 0) + 1,
          ...txData,
          date: txData.date || new Date().toISOString().split('T')[0],
        };
        setTransactions(prev => [newTx, ...prev]);
        return newTx;
      } else {
        // Call API
        const payload = {
          amount: Math.abs(txData.amount),
          description: txData.description,
          date: txData.date,
          currencyId: 1, // CHF
          categoryId: txData.categoryId || 1,
          accountId: txData.accountId || 1,
        };
        
        if (txData.type === 'expense') {
          const created = await api.createExpense(payload);
          const newTx = transformExpense(created);
          setTransactions(prev => [newTx, ...prev]);
          return newTx;
        } else {
          const created = await api.createIncome(payload);
          const newTx = transformIncome(created);
          setTransactions(prev => [newTx, ...prev]);
          return newTx;
        }
      }
    } catch (err) {
      console.error('Error adding transaction:', err);
      throw err;
    }
  }, []);

  const addTransfer = useCallback(async (transferData) => {
    try {
      const created = await api.createTransfer(transferData);
      const newTx = transformTransfer(created);
      setTransactions(prev => [newTx, ...prev]);
      return newTx;
    } catch (err) {
      console.error('Error adding transfer:', err);
      throw err;
    }
  }, []);

  const deleteTransaction = useCallback(async (id, type = 'expense') => {
    try {
      if (USE_MOCK) {
        setTransactions(prev => prev.filter(t => t.id !== id));
      } else {
        if (type === 'income') {
          await api.deleteIncome(id);
        } else {
          await api.deleteExpense(id);
        }
        setTransactions(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error('Error deleting transaction:', err);
      throw err;
    }
  }, []);

  const updateTransaction = useCallback(async (id, data, type = 'expense') => {
    try {
      if (USE_MOCK) {
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
        return { id, ...data };
      } else {
        if (type === 'income') {
          const updated = await api.updateIncome(id, data);
          const transformed = transformIncome(updated);
          setTransactions(prev => prev.map(t => t.id === id ? transformed : t));
          return transformed;
        } else {
          const updated = await api.updateExpense(id, data);
          const transformed = transformExpense(updated);
          setTransactions(prev => prev.map(t => t.id === id ? transformed : t));
          return transformed;
        }
      }
    } catch (err) {
      console.error('Error updating transaction:', err);
      throw err;
    }
  }, []);

  const groupedByDay = useMemo(() => {
    const groups = {};
    transactions.forEach(tx => {
      const day = tx.date;
      if (!groups[day]) groups[day] = [];
      groups[day].push(tx);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => new Date(b) - new Date(a))
      .map(([date, txs]) => ({ date, transactions: txs }));
  }, [transactions]);

  const totals = useMemo(() => {
    const income = transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expenses = transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  return {
    transactions,
    groupedByDay,
    totals,
    isEmpty: transactions.length === 0,
    loading,
    error,
    addTransaction,
    addTransfer,
    deleteTransaction,
    updateTransaction,
    refresh: () => fetchTransactions(),
  };
};

export const useAllTransactions = (year) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!year) return;
    setLoading(true);
    
    try {
      if (USE_MOCK) {
        const filtered = mockTransactions.filter(tx => {
          const txDate = new Date(tx.date);
          return txDate.getFullYear() === year;
        });
        setTransactions(filtered);
      } else {
        const startDate = `${year}-01-01`;
        const endDate = `${year + 1}-01-01`;
        
        const [expenses, incomes, transfers] = await Promise.all([
          api.getExpenses({ startDate, endDate }),
          api.getIncomes({ startDate, endDate }),
          api.getTransfers(),
        ]);
        
        const allTx = [
          ...expenses.map(transformExpense),
          ...incomes.map(transformIncome),
          ...transfers.map(transformTransfer),
        ];
        setTransactions(allTx);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const groupedByMonth = useMemo(() => {
    const groups = {};
    transactions.forEach(tx => {
      const month = tx.date.substring(0, 7);
      if (!groups[month]) groups[month] = [];
      groups[month].push(tx);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([monthKey, txs]) => ({ month: monthKey, transactions: txs }));
  }, [transactions]);

  const refresh = useCallback(() => {
    fetchAll();
  }, []);

  return { transactions, groupedByMonth, loading, refresh };
};
