"use client";

import { AmountText } from "@/components/ui/AmountText";

const ACCENT_COLOR = "#FF5A3C";
const INCOME_COLOR = "#4A90D9";

export const StatTabs = ({ activeTab, onTabChange, income, expenses, isMobile = false }) => {
  const amountSize = isMobile ? "md" : "lg";

  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "var(--card-bg)",
        boxShadow: "var(--shadow-sm)",
        overflow: "hidden",
        zIndex: 15,
      }}
    >
      <button
        onClick={() => onTabChange("income")}
        style={{
          flex: 1,
          padding: "16px",
          textAlign: "center",
          borderRight: "1px solid var(--border)",
          backgroundColor: activeTab === "income" ? `${INCOME_COLOR}10` : "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            marginBottom: "4px",
          }}
        >
          Revenus
        </div>
        <AmountText amount={income} size={amountSize} />
      </button>

      <button
        onClick={() => onTabChange("expense")}
        style={{
          flex: 1,
          padding: "16px",
          textAlign: "center",
          backgroundColor: activeTab === "expense" ? `${ACCENT_COLOR}10` : "transparent",
          border: "none",
          cursor: "pointer",
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
        <AmountText amount={-expenses} size={amountSize} />
      </button>
    </div>
  );
};
