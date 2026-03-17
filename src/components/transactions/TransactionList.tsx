'use client';

import { useMemo } from 'react';
import { TransactionGroup } from './TransactionGroup';
import { EmptyState } from '@/components/ui/EmptyState';
import { TransactionFilters, TransactionGroup as TransactionGroupType } from '@/types/transactions';

interface TransactionListProps {
  groupedTransactions?: TransactionGroupType[];
  isDesktop?: boolean;
  onAddClick?: () => void;
  onTransactionClick?: (transaction: unknown) => void;
  filters?: TransactionFilters | null;
}

export const TransactionList = ({ 
  groupedTransactions, 
  isDesktop = false, 
  onAddClick, 
  onTransactionClick,
  filters = null,
}: TransactionListProps) => {
  const filteredGroups = useMemo(() => {
    if (!filters || !groupedTransactions) return groupedTransactions;
    
    return groupedTransactions
      .map(group => ({
        ...group,
        transactions: group.transactions.filter(tx => {
          if (filters.type && tx.type !== filters.type) return false;
          if (filters.categoryId && tx.categoryId !== filters.categoryId) return false;
          if (filters.accountId && tx.accountId !== filters.accountId) return false;
          
          if (filters.month) {
            const txDate = new Date(tx.date);
            const txMonth = txDate.getUTCMonth() + 1;
            if (txMonth !== filters.month) return false;
          }
          
          return true;
        }),
      }))
      .filter(group => group.transactions.length > 0);
  }, [groupedTransactions, filters]);

  if (!filteredGroups || filteredGroups.length === 0) {
    return (
      <EmptyState 
        message={filters ? "Aucune transaction pour ces filtres" : "Aucune transaction pour cette periode"}
        showButton={!filters}
        onAddClick={onAddClick}
      />
    );
  }
  
  return (
    <div style={{ padding: '16px' }}>
      {filteredGroups.map(group => (
        <TransactionGroup
          key={group.date}
          date={group.date}
          transactions={group.transactions}
          isDesktop={isDesktop}
          onTransactionClick={onTransactionClick}
        />
      ))}
    </div>
  );
};
