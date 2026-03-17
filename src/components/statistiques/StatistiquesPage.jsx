"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { StatTabs } from "./StatTabs";
import { StatChart } from "./StatChart";
import { StatCategoryList } from "./StatCategoryList";
import { EmptyState } from "@/components/ui/EmptyState";
import api from "@/lib/api";

const CHART_COLORS = [
  "#FF5A3C",
  "#4A90D9",
  "#34C759",
  "#FF9500",
  "#AF52DE",
  "#FF2D55",
  "#5AC8FA",
  "#FFCC00",
];

const INCOME_COLORS = [
  "#4A90D9",
  "#34C759",
  "#5AC8FA",
  "#30D158",
  "#64D2FF",
  "#32D74B",
];

const EXPENSE_COLORS = [
  "#FF5A3C",
  "#FF9500",
  "#FF2D55",
  "#FF6B6B",
  "#FF8C00",
  "#E74C3C",
];

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

const getWeekRange = (year, month, weekNum) => {
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);
  
  const startOfWeek = (weekNum - 1) * 7 + 1;
  const endOfWeek = weekNum * 7;
  
  const startDate = new Date(year, month - 1, startOfWeek);
  if (startDate > lastDayOfMonth) {
    return null;
  }
  
  const endDate = new Date(year, month - 1, Math.min(endOfWeek, lastDayOfMonth.getDate()));
  
  return {
    start: startDate,
    end: endDate,
    startStr: `${startDate.getDate()}/${month}`,
    endStr: `${endDate.getDate()}/${month}`,
  };
};

const getWeeksInMonth = (year, month) => {
  const lastDay = new Date(year, month, 0).getDate();
  return Math.ceil(lastDay / 7);
};

const getCurrentWeekNumber = (year, month) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  
  if (year === currentYear && month === currentMonth) {
    return Math.ceil(currentDay / 7);
  }
  return 1;
};

export const StatistiquesPage = ({ 
  isMobile = false, 
  periodMode: externalPeriodMode,
  customStartDate = '',
  customEndDate = '',
}) => {
  const [periodMode, setPeriodMode] = useState(externalPeriodMode || "month");
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(3);
  const [weekNumber, setWeekNumber] = useState(getCurrentWeekNumber(2026, 3));
  const [activeTab, setActiveTab] = useState("income");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentPeriodMode = externalPeriodMode !== undefined ? externalPeriodMode : periodMode;

  useEffect(() => {
    if (externalPeriodMode !== undefined) {
      setPeriodMode(externalPeriodMode);
    }
  }, [externalPeriodMode]);

  useEffect(() => {
    const weeksInCurrentMonth = getWeeksInMonth(year, month);
    if (weekNumber > weeksInCurrentMonth) {
      setWeekNumber(weeksInCurrentMonth);
    }
  }, [year, month]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let startDate, endDate;

        if (currentPeriodMode === "custom" && customStartDate && customEndDate) {
          startDate = customStartDate;
          const end = new Date(customEndDate);
          end.setDate(end.getDate() + 1);
          endDate = end.toISOString().split('T')[0];
        } else if (currentPeriodMode === "year") {
          startDate = `${year}-01-01`;
          endDate = `${year + 1}-01-01`;
        } else {
          const lastDayOfMonth = new Date(year, month, 0).getDate();
          startDate = `${year}-${String(month).padStart(2, '0')}-01`;
          endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;
        }

        const [expenses, incomes] = await Promise.all([
          api.getExpenses({ startDate, endDate }),
          api.getIncomes({ startDate, endDate }),
        ]);

        const allTx = [
          ...expenses.map((e) => ({ ...e, type: "expense" })),
          ...incomes.map((i) => ({ ...i, type: "income" })),
        ];
        setTransactions(allTx);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year, month, currentPeriodMode, customStartDate, customEndDate]);

  const getFilteredTransactions = () => {
    return transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      const txYear = txDate.getUTCFullYear();
      const txMonth = txDate.getUTCMonth() + 1;
      const txDay = txDate.getUTCDate();

      if (currentPeriodMode === "year") {
        return txYear === year;
      } else if (currentPeriodMode === "month") {
        return txYear === year && txMonth === month;
      } else if (currentPeriodMode === "week") {
        const weekRange = getWeekRange(year, month, weekNumber);
        if (!weekRange) return false;
        
        // Usar UTC para evitar desfase de timezone
        const txDateUTC = Date.UTC(txYear, txMonth - 1, txDay);
        const startUTC = Date.UTC(weekRange.start.getFullYear(), weekRange.start.getMonth(), weekRange.start.getDate());
        const endUTC = Date.UTC(weekRange.end.getFullYear(), weekRange.end.getMonth(), weekRange.end.getDate(), 23, 59, 59, 999);
        
        return txDateUTC >= startUTC && txDateUTC <= endUTC;
      } else if (currentPeriodMode === "custom" && customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        return txDate >= start && txDate <= end;
      }
      return true;
    });
  };

  const filteredTransactions = useMemo(() => getFilteredTransactions(), [
    transactions,
    year,
    month,
    weekNumber,
    currentPeriodMode,
    customStartDate,
    customEndDate,
  ]);

  const categoryData = useMemo(() => {
    const colors = activeTab === "income" ? INCOME_COLORS : EXPENSE_COLORS;
    
    const txs = filteredTransactions
      .filter((tx) => tx.type === activeTab)
      .map((tx, idx) => ({
        id: tx.id,
        amount: parseFloat(tx.amount),
        categoryId: tx.categoryId,
        category: tx.Category,
        categoryIcon: tx.Category?.icon || "folder",
        categoryName: tx.Category?.name || "Autre",
        date: tx.date,
        color: tx.Category?.color || colors[idx % colors.length],
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return txs;
  }, [filteredTransactions, activeTab]);

  const totals = useMemo(() => {
    const income = filteredTransactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    const expenses = filteredTransactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0);
    return { income, expenses };
  }, [filteredTransactions]);

  const hasData = filteredTransactions.some((tx) => tx.type === activeTab);

  const getPeriodLabel = () => {
    if (currentPeriodMode === "year") return `${year}`;
    if (currentPeriodMode === "month") return `${MONTHS[month - 1]} ${year}`;
    if (currentPeriodMode === "week") {
      const weekRange = getWeekRange(year, month, weekNumber);
      if (weekRange) {
        return `${weekRange.startStr} ~ ${weekRange.endStr}`;
      }
      return `Semaine ${weekNumber}`;
    }
    if (currentPeriodMode === "custom" && customStartDate && customEndDate) {
      const formatDate = (d) => {
        const date = new Date(d);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      };
      return `${formatDate(customStartDate)} - ${formatDate(customEndDate)}`;
    }
    return "Période";
  };

  const goToPrevious = () => {
    if (currentPeriodMode === "year") {
      setYear((y) => y - 1);
    } else if (currentPeriodMode === "month") {
      if (month === 1) {
        setMonth(12);
        setYear((y) => y - 1);
      } else {
        setMonth((m) => m - 1);
      }
    } else if (currentPeriodMode === "week") {
      if (weekNumber > 1) {
        setWeekNumber((w) => w - 1);
      } else {
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        setMonth(prevMonth);
        setYear(prevYear);
        setWeekNumber(getWeeksInMonth(prevYear, prevMonth));
      }
    }
  };

  const goToNext = () => {
    if (currentPeriodMode === "year") {
      setYear((y) => y + 1);
    } else if (currentPeriodMode === "month") {
      if (month === 12) {
        setMonth(1);
        setYear((y) => y + 1);
      } else {
        setMonth((m) => m + 1);
      }
    } else if (currentPeriodMode === "week") {
      const weeksInCurrentMonth = getWeeksInMonth(year, month);
      if (weekNumber < weeksInCurrentMonth) {
        setWeekNumber((w) => w + 1);
      } else {
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        setMonth(nextMonth);
        setYear(nextYear);
        setWeekNumber(1);
      }
    }
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", paddingBottom: isMobile ? "80px" : "0" }}>
      {/* Navigator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          padding: "16px",
          backgroundColor: "var(--card-bg)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <button
            onClick={goToPrevious}
            style={{
              minWidth: "48px",
              minHeight: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-sm)",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={24} color="var(--text-primary)" />
          </button>

          <span
            style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "var(--text-primary)",
              minWidth: "140px",
              textAlign: "center",
            }}
          >
            {getPeriodLabel()}
          </span>

          <button
            onClick={goToNext}
            style={{
              minWidth: "48px",
              minHeight: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-sm)",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
            }}
          >
            <ChevronRight size={24} color="var(--text-primary)" />
          </button>
      </div>

      {/* Tabs */}
      <StatTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        income={totals.income}
        expenses={totals.expenses}
        isMobile={isMobile}
      />

      {/* Content */}
      {loading ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "var(--text-secondary)",
          }}
        >
          Chargement...
        </div>
      ) : !hasData ? (
        <EmptyState message="Aucune donnée pour cette période" />
      ) : (
        <div
          style={{
            padding: isMobile ? "16px" : "24px",
          }}
        >
          {isMobile ? (
            <>
              {/* Mobile: stacked */}
              <div
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderRadius: "16px",
                  padding: "24px 16px",
                  marginBottom: "16px",
                }}
              >
                <StatChart data={categoryData} isMobile={true} type={activeTab} />
              </div>
              <div
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderRadius: "16px",
                  padding: "16px 0",
                }}
              >
                <StatCategoryList data={categoryData} />
              </div>
            </>
          ) : (
            /* Desktop: two columns */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
              }}
            >
              <div
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderRadius: "16px",
                  padding: "24px",
                  paddingTop: "32px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <StatChart data={categoryData} isMobile={false} type={activeTab} />
              </div>
              <div
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderRadius: "16px",
                  padding: "16px 0",
                  maxHeight: "500px",
                  overflowY: "auto",
                }}
              >
                <StatCategoryList data={categoryData} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
