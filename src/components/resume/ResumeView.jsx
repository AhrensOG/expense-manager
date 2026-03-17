'use client';

import { useState, useEffect } from 'react';
import { Wallet, CreditCard, TrendingUp, TrendingDown, PiggyBank, Building2, Banknote } from 'lucide-react';
import api from '@/lib/api';

const ACCENT_COLOR = '#FF5A3C';
const INCOME_COLOR = '#4A90D9';

const formatAmount = (amount) => {
  return Math.abs(amount).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' CHF';
};

const getAccountIcon = (accountName) => {
  const name = accountName?.toLowerCase() || '';
  if (name.includes('espèces') || name.includes('liquide') || name.includes('cash')) return Banknote;
  if (name.includes('épargne') || name.includes('savings')) return PiggyBank;
  if (name.includes('carte') || name.includes('card')) return CreditCard;
  if (name.includes('banque') || name.includes('bank')) return Building2;
  return Wallet;
};

export const ComptesSummary = ({ year, month, isDesktop = false }) => {
  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});
  const [totals, setTotals] = useState({ income: 0, expenses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountsData, expenses, incomes, transfers] = await Promise.all([
          api.getAccounts(),
          api.getExpenses({ 
            startDate: `${year}-${String(month).padStart(2, '0')}-01`,
            endDate: month === 12 
              ? `${year + 1}-01-01` 
              : `${year}-${String(month + 1).padStart(2, '0')}-01`
          }),
          api.getIncomes({ 
            startDate: `${year}-${String(month).padStart(2, '0')}-01`,
            endDate: month === 12 
              ? `${year + 1}-01-01` 
              : `${year}-${String(month + 1).padStart(2, '0')}-01`
          }),
          api.getTransfers(),
        ]);
        
        setAccounts(accountsData);
        
        const initialBalances = {};
        accountsData.forEach(acc => {
          initialBalances[acc.id] = parseFloat(acc.balance) || 0;
        });

        const accActivity = {};
        expenses.forEach(e => {
          const accId = e.accountId;
          if (!accId) return;
          if (!accActivity[accId]) accActivity[accId] = { income: 0, expenses: 0, transfersOut: 0, transfersIn: 0 };
          accActivity[accId].expenses += parseFloat(e.amount);
        });
        incomes.forEach(i => {
          const accId = i.accountId;
          if (!accId) return;
          if (!accActivity[accId]) accActivity[accId] = { income: 0, expenses: 0, transfersOut: 0, transfersIn: 0 };
          accActivity[accId].income += parseFloat(i.amount);
        });

        const transfersInMonth = transfers.filter(t => {
          const txDate = new Date(t.date);
          return txDate.getFullYear() === year && txDate.getMonth() + 1 === month;
        });

        transfersInMonth.forEach(t => {
          if (t.fromAccountId) {
            if (!accActivity[t.fromAccountId]) accActivity[t.fromAccountId] = { income: 0, expenses: 0, transfersOut: 0, transfersIn: 0 };
            accActivity[t.fromAccountId].transfersOut += parseFloat(t.amount);
          }
          if (t.toAccountId) {
            if (!accActivity[t.toAccountId]) accActivity[t.toAccountId] = { income: 0, expenses: 0, transfersOut: 0, transfersIn: 0 };
            accActivity[t.toAccountId].transfersIn += parseFloat(t.amount);
          }
        });

        const totalIncome = incomes.reduce((sum, i) => sum + parseFloat(i.amount), 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
        const totalTransfersOut = transfersInMonth.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const totalTransfersIn = transfersInMonth.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        setTotals({ 
          income: totalIncome, 
          expenses: totalExpenses,
          transfersOut: totalTransfersOut,
          transfersIn: totalTransfersIn,
        });

        const finalBalances = {};
        accountsData.forEach(acc => {
          const activity = accActivity[acc.id] || { income: 0, expenses: 0, transfersOut: 0, transfersIn: 0 };
          finalBalances[acc.id] = {
            current: parseFloat(acc.balance) || 0,
            income: activity.income,
            expenses: activity.expenses,
            transfersOut: activity.transfersOut,
            transfersIn: activity.transfersIn,
          };
        });
        
        setBalances(finalBalances);
      } catch (err) {
        console.error('Error fetching accounts:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [year, month]);

  if (loading) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Chargement...
      </div>
    );
  }

  const netBalance = totals.income - totals.expenses;
  const netTransfers = totals.transfersIn - totals.transfersOut;

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      borderRadius: '16px',
      boxShadow: 'var(--shadow-sm)',
      margin: '16px',
      padding: '24px',
    }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: `${ACCENT_COLOR}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Wallet size={24} color={ACCENT_COLOR} />
          </div>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              margin: 0,
            }}>
              Résumé du mois
            </h2>
            <span style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
            }}>
              {month}/{year}
            </span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '24px',
        }}>
          <div style={{
            backgroundColor: `${INCOME_COLOR}10`,
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: `${INCOME_COLOR}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TrendingUp size={20} color={INCOME_COLOR} />
            </div>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Revenus</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: INCOME_COLOR }}>
                +{formatAmount(totals.income)}
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: `${ACCENT_COLOR}10`,
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: `${ACCENT_COLOR}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TrendingDown size={20} color={ACCENT_COLOR} />
            </div>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Dépenses</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: ACCENT_COLOR }}>
                -{formatAmount(totals.expenses)}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: netBalance >= 0 ? `${INCOME_COLOR}08` : `${ACCENT_COLOR}08`,
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: '500' }}>
            Balance du mois
          </span>
          <span style={{ 
            fontSize: '20px', 
            fontWeight: '700', 
            color: netBalance >= 0 ? INCOME_COLOR : ACCENT_COLOR 
          }}>
            {netBalance >= 0 ? '+' : '-'}{formatAmount(netBalance)}
          </span>
        </div>

        {netTransfers !== 0 && (
          <div style={{
            backgroundColor: '#8E8E9310',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Transferts nets
            </span>
            <span style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: 'var(--text-secondary)' 
            }}>
              {netTransfers > 0 ? '+' : '-'}{formatAmount(netTransfers)}
            </span>
          </div>
        )}

        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: 'var(--text-primary)',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Building2 size={18} />
          Comptes ({accounts.length})
        </h3>
        
        {accounts.length === 0 ? (
          <div style={{ 
            padding: '24px 0', 
            textAlign: 'center', 
            color: 'var(--text-secondary)' 
          }}>
            Aucun compte
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {accounts.map(acc => {
              const bal = balances[acc.id] || { current: 0, income: 0, expenses: 0, transfersOut: 0, transfersIn: 0 };
              const netChange = bal.income - bal.expenses + bal.transfersIn - bal.transfersOut;
              const AccountIcon = getAccountIcon(acc.name);
              
              return (
                <div key={acc.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  backgroundColor: 'var(--bg)',
                  borderRadius: '12px',
                  minHeight: '52px',
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--card-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  }}>
                    <AccountIcon size={20} color="var(--text-secondary)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-primary)' }}>
                      {acc.name}
                    </div>
                    {/* <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Solde actuel: {formatAmount(bal.current)}
                    </div> */}
                  </div>
                  <div style={{ 
                    fontSize: '15px', 
                    fontWeight: '600', 
                    color: netChange >= 0 ? INCOME_COLOR : ACCENT_COLOR,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    {netChange !== 0 && (
                      <span style={{ fontSize: '12px' }}>
                        {netChange > 0 ? '↑' : '↓'}
                      </span>
                    )}
                    {netChange !== 0 ? formatAmount(netChange) : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };
