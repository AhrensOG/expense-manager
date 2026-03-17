"use client";

import { useMemo } from "react";
import { AmountText } from "@/components/ui/AmountText";
import { TransactionFilters, TransactionGroup, TransactionTotals } from "@/types/transactions";

export const SummaryBar = ({ 
  totals, 
  isMobile = false, 
  filters = null, 
  groupedTransactions = [] 
}: { 
  totals: TransactionTotals;
  isMobile?: boolean;
  filters?: TransactionFilters | null;
  groupedTransactions?: TransactionGroup[];
}) => {
  const amountSize = isMobile ? "md" : "lg";

  const filteredTotals = useMemo(() => {
    if (!filters || !groupedTransactions || groupedTransactions.length === 0) {
      return totals;
    }

    let income = 0;
    let expenses = 0;

    groupedTransactions.forEach(group => {
      group.transactions.forEach(tx => {
        if (filters.type && tx.type !== filters.type) return;
        if (filters.categoryId && tx.categoryId !== filters.categoryId) return;
        if (filters.accountId && tx.accountId !== filters.accountId) return;
        
        if (filters.month) {
          const txDate = new Date(tx.date);
          const txMonth = txDate.getUTCMonth() + 1;
          if (txMonth !== filters.month) return;
        }

        if (tx.type === "income") {
          income += tx.amount;
        } else if (tx.type === "expense") {
          expenses += Math.abs(tx.amount);
        }
      });
    });

    return { income, expenses, balance: income - expenses };
  }, [totals, filters, groupedTransactions]);

  const hasFilters = filters && Object.values(filters).some(v => v !== null);

  return (
    <div
      style={{
        // position: "sticky",
        // top: isMobile ? "165px" : "189px",
        display: "flex",
        backgroundColor: "var(--card-bg)",
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
        zIndex: 20,
      }}
    >
      <div
        style={{
          flex: 1,
          padding: "16px",
          textAlign: "center",
          borderRight: "1px solid var(--border)",
          position: "relative",
        }}
      >
        {hasFilters && (
          <div
            style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "var(--accent)",
            }}
          />
        )}
        <div
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            marginBottom: "4px",
          }}
        >
          Revenus
        </div>
        <AmountText amount={filteredTotals.income} size={amountSize} />
      </div>
      <div
        style={{
          flex: 1,
          padding: "16px",
          textAlign: "center",
          borderRight: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            marginBottom: "4px",
          }}
        >
          Dépenses
        </div>
        <AmountText amount={-filteredTotals.expenses} size={amountSize} />
      </div>
      <div style={{ flex: 1, padding: "16px", textAlign: "center" }}>
        <div
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            marginBottom: "4px",
          }}
        >
          Solde
        </div>
        <AmountText amount={filteredTotals.balance} size={amountSize} />
      </div>
    </div>
  );
};
