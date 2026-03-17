import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getAccounts();
      setAccounts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const addAccount = (account) => {
    setAccounts((prev) => [...prev, account]);
  };

  const updateAccountInList = (updatedAccount) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === updatedAccount.id ? updatedAccount : acc
      )
    );
  };

  const removeAccount = (accountId) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
  };

  return {
    accounts,
    loading,
    error,
    refresh: fetchAccounts,
    addAccount,
    updateAccountInList,
    removeAccount,
  };
};

export const useAccountSummary = (accountId, year, month) => {
  const [summary, setSummary] = useState({
    deposits: 0,
    withdrawals: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    if (!accountId) return;

    try {
      setLoading(true);

      const [expenses, incomes, transfers] = await Promise.all([
        api.getExpenses({ accountId }),
        api.getIncomes({ accountId }),
        api.getTransfers(),
      ]);

      const transfersData = transfers || [];

      const accountTransfers = transfersData.filter(
        (t) => t.fromAccountId === accountId || t.toAccountId === accountId
      );

      const deposits = incomes.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
      
      const withdrawalFromExpenses = expenses.reduce(
        (sum, tx) => sum + Math.abs(parseFloat(tx.amount || 0)),
        0
      );

      const withdrawalFromTransfers = accountTransfers
        .filter((t) => t.fromAccountId === accountId)
        .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

      const depositsFromTransfers = accountTransfers
        .filter((t) => t.toAccountId === accountId)
        .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

      const totalDeposits = deposits + depositsFromTransfers;
      const totalWithdrawals = withdrawalFromExpenses + withdrawalFromTransfers;
      const calculatedBalance = totalDeposits - totalWithdrawals;

      setSummary({
        deposits: totalDeposits,
        withdrawals: totalWithdrawals,
        balance: calculatedBalance,
      });
    } catch (err) {
      console.error('Error fetching account summary:', err);
    } finally {
      setLoading(false);
    }
  }, [accountId, year, month]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    refresh: fetchSummary,
  };
};
