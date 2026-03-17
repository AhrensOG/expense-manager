import { formatAmount } from '@/utils/currencyUtils';

export const AmountText = ({ amount, showSign = false, size = 'md' }) => {
  console.log(amount)
  const isIncome = amount > 0;
  const color = isIncome ? 'var(--income)' : 'var(--accent)';
  
  const sizes = {
    sm: { fontSize: '14px', fontWeight: '600' },
    md: { fontSize: '17px', fontWeight: '700' },
    lg: { fontSize: '22px', fontWeight: '700' },
    xl: { fontSize: '26px', fontWeight: '700' },
  };
  
  const prefix = showSign && amount > 0 ? '+' : '';
  const formatted = formatAmount(amount).replace(/^[+-]/, '');
  
  return (
    <span style={{ color, ...sizes[size] }}>
      {prefix}{formatted}
    </span>
  );
};
