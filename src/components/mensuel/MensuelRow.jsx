'use client';

import { formatDate, formatWeekRange, getWeeksInMonth } from '@/utils/dateUtils';
import { AmountText } from '@/components/ui/AmountText';
import { isCurrentMonth } from '@/utils/dateUtils';

const months = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export const MensuelMonthRow = ({ year, month, transactions, onClick }) => {
  const income = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const isCurrent = isCurrentMonth(year, month);
  
  return (
    <button
      onClick={onClick}
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
      }}
    >
      <div>
        <div style={{
          fontSize: '17px',
          fontWeight: '700',
          color: 'var(--text-primary)',
        }}>
          {months[month - 1]}
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          {formatDate(`${year}-${month.toString().padStart(2, '0')}-01`, 'short')} - {formatDate(`${year}-${month.toString().padStart(2, '0')}-28`, 'short')}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '16px' }}>
        <AmountText amount={income} size="sm" showSign />
        <AmountText amount={-expenses} size="sm" showSign />
      </div>
    </button>
  );
};

export const MensuelWeekRow = ({ year, month, week, transactions, onClick }) => {
  const income = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const now = new Date();
  const isCurrentWeek = now.getFullYear() === year && now.getMonth() + 1 === month;
  
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        backgroundColor: isCurrentWeek ? 'var(--hover)' : 'var(--card-bg)',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '4px',
        textAlign: 'left',
        minHeight: '52px',
        border: isCurrentWeek ? '1px solid var(--accent)' : '1px solid transparent',
      }}
    >
      <span style={{ fontSize: '15px', color: 'var(--text-secondary)', minWidth: '80px' }}>
        {week}
      </span>
      <div style={{ display: 'flex', gap: '24px' }}>
        <AmountText amount={income} size="sm" showSign />
        <AmountText amount={-expenses} size="sm" showSign />
      </div>
    </button>
  );
};
