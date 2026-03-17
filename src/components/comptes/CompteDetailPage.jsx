'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Wallet, Building, CreditCard, PiggyBank, Folder, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import api from '@/lib/api';
import { getIconComponent } from '@/lib/icons';
import { AmountText } from '@/components/ui/AmountText';
import { formatDate } from '@/utils/dateUtils';

const iconMap = {
  cash: Wallet,
  bank: Building,
  credit_card: CreditCard,
  savings: PiggyBank,
  other: Folder,
};

export const CompteDetailPage = ({ accountId, onBack, isMobile }) => {
  const [account, setAccount] = useState(null);
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(3);
  const [activeTab, setActiveTab] = useState('diario');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [accountData, expenses, incomes, transfers, allAccounts] = await Promise.all([
          api.getAccounts(),
          api.getExpenses({ accountId }),
          api.getIncomes({ accountId }),
          api.getTransfers(),
          api.getAccounts(),
        ]);

        const accountInfo = accountData.find(a => a.id === accountId);
        setAccount(accountInfo);

        const accountMap = {};
        allAccounts.forEach(acc => {
          accountMap[acc.id] = acc.name;
        });

        const transferTxs = transfers
          .filter(t => t.fromAccountId === accountId || t.toAccountId === accountId)
          .map(t => {
            const isOutgoing = t.fromAccountId === accountId;
            return {
              ...t,
              type: isOutgoing ? 'transfer_out' : 'transfer_in',
              amount: isOutgoing ? -Math.abs(parseFloat(t.amount)) : Math.abs(parseFloat(t.amount)),
              displayDate: t.date,
              description: isOutgoing 
                ? `Enviar a ${accountMap[t.toAccountId] || 'Cuenta'}`
                : `Recibir de ${accountMap[t.fromAccountId] || 'Cuenta'}`,
            };
          });

        const allTransactions = [
          ...expenses.map(e => ({
            ...e,
            type: 'expense',
            displayDate: e.date,
          })),
          ...incomes.map(i => ({
            ...i,
            type: 'income',
            displayDate: i.date,
          })),
          ...transferTxs,
        ];

        setTransactions(allTransactions);
      } catch (err) {
        console.error('Error fetching account data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (accountId) {
      fetchData();
    }
  }, [accountId]);

  const filteredTransactions = useMemo(() => {
    const currentMonthTxs = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getFullYear() === year && txDate.getUTCMonth() + 1 === month;
    });

    const previousTxs = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getFullYear() < year || 
        (txDate.getFullYear() === year && txDate.getUTCMonth() + 1 < month);
    });

    let initialBalance = 0;
    previousTxs.forEach(tx => {
      const amount = parseFloat(tx.amount || 0);
      initialBalance += amount;
    });

    const sortedTxs = [...currentMonthTxs].sort((a, b) => new Date(b.date) - new Date(a.date));
    let runningBalance = initialBalance;
    
    return sortedTxs.map(tx => {
      const amount = parseFloat(tx.amount || 0);
      runningBalance += amount;
      return { ...tx, saldo: runningBalance };
    }).reverse();
  }, [transactions, year, month]);

  const groupedByDay = useMemo(() => {
    const groups = {};
    filteredTransactions.forEach(tx => {
      const day = tx.date.split('T')[0];
      if (!groups[day]) groups[day] = [];
      groups[day].push(tx);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => new Date(b) - new Date(a))
      .map(([date, txs]) => ({ date, transactions: txs }));
  }, [filteredTransactions]);

  const totals = useMemo(() => {
    const deposits = filteredTransactions
      .filter(tx => tx.type === 'income' || tx.type === 'transfer_in')
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);

    const withdrawals = filteredTransactions
      .filter(tx => tx.type === 'expense' || tx.type === 'transfer_out')
      .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount || 0)), 0);

    return {
      deposits,
      withdrawals,
      balance: deposits - withdrawals,
      accountBalance: parseFloat(account?.balance || 0),
    };
  }, [filteredTransactions, account]);

  const monthlyData = useMemo(() => {
    const previousYearsTx = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getFullYear() < year;
    });

    const previousIncome = previousYearsTx
      .filter(t => t.type === 'income' || t.type === 'transfer_in')
      .reduce((s, t) => s + parseFloat(t.amount || 0), 0);

    const previousExpense = previousYearsTx
      .filter(t => t.type === 'expense' || t.type === 'transfer_out')
      .reduce((s, t) => s + Math.abs(parseFloat(t.amount || 0)), 0);

    let cumulativeBalance = previousIncome - previousExpense;
    
    const data = [];
    for (let m = 1; m <= 12; m++) {
      const monthTx = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getFullYear() === year && txDate.getUTCMonth() + 1 === m;
      });

      const income = monthTx
        .filter(t => t.type === 'income' || t.type === 'transfer_in')
        .reduce((s, t) => s + parseFloat(t.amount || 0), 0);

      const expense = monthTx
        .filter(t => t.type === 'expense' || t.type === 'transfer_out')
        .reduce((s, t) => s + Math.abs(parseFloat(t.amount || 0)), 0);

      const balance = income - expense;
      cumulativeBalance += balance;
      const lastDay = new Date(year, m, 0).getDate();
      data.push({ month: m, income, expense, balance, saldo: cumulativeBalance, lastDay });
    }
    return data.reverse();
  }, [transactions, year]);

  const yearlyData = useMemo(() => {
    const currentYear = 2026;
    const yearsWithData = [...new Set(transactions.map(tx => new Date(tx.date).getFullYear()))];
    const allYears = [currentYear, currentYear + 1, ...yearsWithData.filter(y => y < currentYear)].filter((v, i, a) => a.indexOf(v) === i);
    
    const sortedYears = [...allYears].sort((a, b) => a - b);
    let cumulativeBalance = 0;
    
    const yearDataMap = {};
    
    sortedYears.forEach(y => {
      const yearTx = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getFullYear() === y;
      });

      const income = yearTx
        .filter(t => t.type === 'income' || t.type === 'transfer_in')
        .reduce((s, t) => s + parseFloat(t.amount || 0), 0);

      const expense = yearTx
        .filter(t => t.type === 'expense' || t.type === 'transfer_out')
        .reduce((s, t) => s + Math.abs(parseFloat(t.amount || 0)), 0);

      const balance = income - expense;
      cumulativeBalance += balance;
      
      yearDataMap[y] = { year: y, income, expense, balance, saldo: cumulativeBalance };
    });
    
    return allYears.sort((a, b) => b - a).map(y => yearDataMap[y] || { year: y, income: 0, expense: 0, balance: 0, saldo: 0 });
  }, [transactions]);

  const goToPrevious = () => {
    if (activeTab === 'diario') {
      if (month === 1) {
        setMonth(12);
        setYear(y => y - 1);
      } else {
        setMonth(m => m - 1);
      }
    } else if (activeTab === 'mensuel') {
      setYear(y => y - 1);
    }
  };

  const goToNext = () => {
    if (activeTab === 'diario') {
      if (month === 12) {
        setMonth(1);
        setYear(y => y + 1);
      } else {
        setMonth(m => m + 1);
      }
    } else if (activeTab === 'mensuel') {
      setYear(y => y + 1);
    }
  };

  const showNavigatorArrows = activeTab !== 'anual';
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const navigatorLabel = activeTab === 'diario' 
    ? `${months[month - 1]} ${year}`
    : `${year}`;

  const isCurrentYear = year === 2026;


  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Chargement...
      </div>
    );
  }

  const IconComponent = iconMap[account?.type] || Wallet;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: 'var(--card-bg)',
        padding: '16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', minHeight: '48px', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ChevronLeft size={24} color="var(--text-primary)" />
          <span style={{ fontSize: '16px', color: 'var(--text-primary)' }}>Comptes</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconComponent size={20} color="var(--text-secondary)" />
          <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {account?.name}
          </span>
        </div>
        <div style={{ width: 40 }} />
      </header>

{/* Month Navigator */}
  <div style={{ backgroundColor: 'var(--card-bg)', padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
    <button
      onClick={showNavigatorArrows ? goToPrevious : undefined}
      style={{
        minWidth: '40px',
        minHeight: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        border: 'none',
        cursor: showNavigatorArrows ? 'pointer' : 'default',
        opacity: showNavigatorArrows ? 1 : 0.25,
        transition: 'opacity 0.2s',
      }}>
      <ChevronLeft size={24} color="var(--text-primary)" />
    </button>

    <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', minWidth: '120px', textAlign: 'center' }}>
      {navigatorLabel}
    </span>

    <button
      onClick={showNavigatorArrows ? goToNext : undefined}
      style={{
        minWidth: '40px',
        minHeight: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none',
        border: 'none',
        cursor: showNavigatorArrows ? 'pointer' : 'default',
        opacity: showNavigatorArrows ? 1 : 0.25,
        transition: 'opacity 0.2s',
      }}>
      <ChevronLeft size={24} color="var(--text-primary)" style={{ transform: 'rotate(180deg)' }} />
    </button>
  </div>

      {/* Summary Bar */}
      <div style={{
        display: 'flex',
        backgroundColor: 'var(--card-bg)',
        padding: '16px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Dépôts</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--income)' }}>{totals.deposits.toFixed(2)}</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Retraits</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--accent)' }}>{totals.withdrawals.toFixed(2)}</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Balance</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{totals.balance.toFixed(2)}</div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', borderLeft: '1px solid var(--border)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Solde</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: totals.accountBalance >= 0 ? 'var(--income)' : 'var(--accent)' }}>{totals.accountBalance.toFixed(2)}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--border)' }}>
        {['diario', 'mensuel', 'anual'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '14px',
              fontSize: '15px',
              fontWeight: activeTab === tab ? '600' : '400',
              color: activeTab === tab ? 'var(--accent)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab ? '3px solid var(--accent)' : '3px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
            }}
          >
            {tab === 'diario' ? 'Journal' : tab === 'mensuel' ? 'Mensuel' : 'Année'}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'diario' && (
        groupedByDay.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Aucune transaction
          </div>
        ) : (
          <div style={{ padding: '16px' }}>
            {groupedByDay.map(group => (
              <div key={group.date} style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', padding: '8px 0' }}>
                  {new Date(group.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                {group.transactions.map(tx => {
                  const isTransferOut = tx.type === 'transfer_out';
                  const isTransferIn = tx.type === 'transfer_in';
                  const isIncome = tx.type === 'income' || isTransferIn;
                  
                  let Icon;
                  if (isTransferOut) {
                    Icon = ArrowUpRight;
                  } else if (isTransferIn) {
                    Icon = ArrowDownLeft;
                  } else {
                    Icon = getIconComponent(tx.Category?.icon || 'folder');
                  }
                  
                  const amount = parseFloat(tx.amount);
                  const iconColor = isIncome ? '#4A90D9' : '#FF5A3C';

                  return (
                    <div
                      key={tx.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '14px',
                        backgroundColor: 'var(--card-bg)',
                        borderRadius: '12px',
                        marginBottom: '8px',
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: isIncome ? 'rgba(74, 144, 217, 0.15)' : 'rgba(255, 90, 60, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px',
                      }}>
                        <Icon size={20} color={iconColor} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)' }}>
                          {tx.Category?.name || tx.description || (isTransferOut ? 'Transferencia enviada' : isTransferIn ? 'Transferencia recibida' : tx.type)}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', gap: '8px' }}>
                        </div>
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '600', display: "flex", flexDirection: "column", alignItems: "flex-end", color: isIncome ? 'var(--income)' : 'var(--accent)' }}>
                        {isIncome ? '+' : '-'}{Math.abs(amount).toFixed(2)} CHF
                        <span style={{ fontSize: "12px", fontWeight: "normal", color: 'var(--text-secondary)' }}>sal: {tx.saldo?.toFixed(0) || '0'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'mensuel' && (
        <div style={{ padding: '16px' }}>
          {monthlyData.map((m, idx) => (
            <button
              key={m.month}
              onClick={() => { setMonth(m.month); setActiveTab('diario'); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: 'var(--card-bg)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '8px',
                textAlign: 'left',
                minHeight: '64px',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{
                  fontSize: '17px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                }}>
                  {months[m.month - 1]}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  1/{m.month} - {m.lastDay}/{m.month}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ textAlign: 'right' }}>
                  <AmountText amount={m.income} size="sm" showSign />
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>bal: {m.balance >= 0 ? '+' : ''}{m.balance.toFixed(0)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <AmountText amount={-m.expense} size="sm" showSign />
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>sal: {m.saldo.toFixed(0)}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {activeTab === 'anual' && (
        <div style={{ padding: '16px' }}>
          {yearlyData.map((y, idx) => (
            <button
              key={y.year}
              onClick={() => { setYear(y.year); setActiveTab('mensuel'); }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: 'var(--card-bg)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '8px',
                textAlign: 'left',
                minHeight: '64px',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{
                  fontSize: '17px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                }}>
                  {y.year}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  1/1/{y.year} - 31/12/{y.year}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ textAlign: 'right' }}>
                  <AmountText amount={y.income} size="sm" showSign />
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>bal: {y.balance >= 0 ? '+' : ''}{y.balance.toFixed(0)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <AmountText amount={-y.expense} size="sm" showSign />
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>sal: {y.saldo.toFixed(0)}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
