'use client';

import { formatDate, isToday } from '@/utils/dateUtils';
import { TransactionRow } from './TransactionRow';
import { PillBadge } from '@/components/ui/PillBadge';
import { AmountText } from '@/components/ui/AmountText';

export const TransactionGroup = ({ date, transactions, isDesktop = false, onTransactionClick }) => {
  const dayIncome = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const dayExpenses = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const today = isToday(date);
  
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: 'var(--bg)',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontSize: '18px',
            fontWeight: '700',
            color: 'var(--text-primary)',
          }}>
            {formatDate(date, 'full')}
          </span>
          {today && <PillBadge variant="today">Aujourd&apos;hui</PillBadge>}
        </div>
      </div>
      
      <div>
        {transactions.map((tx, index) => (
          <TransactionRow 
            key={`${tx.type}-${tx.id}-${index}`} 
            transaction={tx} 
            isDesktop={isDesktop} 
            onClick={onTransactionClick ? () => onTransactionClick(tx) : undefined}
          />
        ))}
      </div>
    </div>
  );
};
