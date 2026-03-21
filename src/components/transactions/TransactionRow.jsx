'use client';

import React from 'react';
import { Pencil, Trash2, ArrowRightLeft } from 'lucide-react';
import { getIconComponent } from '@/lib/icons';
import { AmountText } from '@/components/ui/AmountText';

export const TransactionRow = ({ transaction, isDesktop = false, onClick }) => {
  const isTransfer = transaction.type === 'transfer';
  
  const amountColor = isTransfer ? 'var(--text-primary)' : (transaction.amount > 0 ? 'var(--income)' : 'var(--accent)');
  
  const IconComponent = transaction.categoryIcon ? getIconComponent(transaction.categoryIcon) : null;
  const iconColor = transaction.categoryColor || 'var(--text-secondary)';
  
  return (
    <div 
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        backgroundColor: 'var(--card-bg)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '8px',
        minHeight: '72px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'scale(1.01)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: isDesktop ? '48px' : '40px',
          height: isDesktop ? '48px' : '40px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: isTransfer ? 'var(--bg)' : `${iconColor}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {isTransfer ? (
            <ArrowRightLeft size={isDesktop ? 24 : 20} color="var(--text-secondary)" />
          ) : IconComponent ? (
            React.createElement(IconComponent, { size: isDesktop ? 24 : 20, color: iconColor })
          ) : (
            <span style={{ fontSize: isDesktop ? '24px' : '20px' }}>💰</span>
          )}
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
            {isTransfer ? 'Transfert' : (transaction.description || transaction.category)}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {isTransfer 
              ? `${transaction.fromAccountName} → ${transaction.toAccountName}`
              : (transaction.accountName || transaction.method)
            }
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '17px', fontWeight: '700', color: amountColor }}>
          {isTransfer ? '' : (transaction.amount > 0 ? '+' : '')}{Math.abs(transaction.amount).toLocaleString('de-DE', { minimumFractionDigits: 2 })} CHF
        </span>
      </div>
    </div>
  );
};
