'use client';

import { useState, useEffect } from 'react';
import { Wallet, Building, CreditCard, PiggyBank, Folder } from 'lucide-react';
import { accountTypes } from '@/data/mockData';
import api from '@/lib/api';

const iconMap = {
  cash: Wallet,
  bank: Building,
  credit_card: CreditCard,
  savings: PiggyBank,
  other: Folder,
};

const apiTypeToLocal = {
  cash: 'liquide',
  bank: 'bancaire',
  credit_card: 'carte',
  savings: 'epargne',
  other: 'autre',
};

const AccountTypeGroup = ({ type, accounts: typeAccounts, onSelectAccount }) => {
  if (typeAccounts.length === 0) return null;

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{
        fontSize: '14px',
        fontWeight: '600',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        padding: '12px 16px',
        backgroundColor: 'var(--bg)',
      }}>
        {type.label}
      </h3>
      <div style={{ padding: '0 8px' }}>
        {typeAccounts.map(account => {
          const IconComponent = iconMap[account.type] || Wallet;
          const balance = parseFloat(account.balance || 0);
          return (
            <button
              key={account.id}
              onClick={() => onSelectAccount(account)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                backgroundColor: 'var(--card-bg)',
                borderRadius: '12px',
                marginBottom: '8px',
                boxShadow: 'var(--shadow-sm)',
                textAlign: 'left',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <IconComponent size={20} color="var(--text-secondary)" />
                </div>
                <span style={{ fontSize: '16px', color: 'var(--text-primary)' }}>
                  {account.name}
                </span>
              </div>
              <span style={{
                fontSize: '18px',
                fontWeight: '700',
                color: balance >= 0 ? 'var(--income)' : 'var(--accent)',
              }}>
                {balance.toLocaleString('de-DE', { minimumFractionDigits: 2 })} CHF
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const ComptesPage = ({ isMobile, onSelectAccount }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await api.getAccounts();
        setAccounts(data);
      } catch (err) {
        console.error('Error fetching accounts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  const totalCapital = accounts.filter(a => parseFloat(a.balance || 0) > 0).reduce((s, a) => s + parseFloat(a.balance || 0), 0);
  const totalADevoir = Math.abs(accounts.filter(a => parseFloat(a.balance || 0) < 0).reduce((s, a) => s + parseFloat(a.balance || 0), 0));
  const totalBalance = accounts.reduce((s, a) => s + parseFloat(a.balance || 0), 0);

  const accountsByType = accountTypes.map(type => ({
    type,
    accounts: accounts.filter(a => apiTypeToLocal[a.type] === type.id),
  }));

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Chargement...
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', paddingBottom: isMobile ? '100px' : '24px' }}>
      {/* Summary Bar */}
      <div style={{
        display: 'flex',
        backgroundColor: 'var(--card-bg)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid var(--border)' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Capital</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--income)' }}>
            {totalCapital.toLocaleString('de-DE', { minimumFractionDigits: 2 })} CHF
          </div>
        </div>
        <div style={{ flex: 1, textAlign: 'center', borderRight: '1px solid var(--border)' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>À devoir</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--accent)' }}>
            {totalADevoir.toLocaleString('de-DE', { minimumFractionDigits: 2 })} CHF
          </div>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Balance</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {totalBalance.toLocaleString('de-DE', { minimumFractionDigits: 2 })} CHF
          </div>
        </div>
      </div>

      {/* Account Groups */}
      {accountsByType.map(({ type, accounts: typeAccounts }) => (
        <AccountTypeGroup
          key={type.id}
          type={type}
          accounts={typeAccounts}
          onSelectAccount={onSelectAccount}
        />
      ))}
    </div>
  );
};
