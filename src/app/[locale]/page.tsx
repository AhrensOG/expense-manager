"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/TopHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { MonthNavigator } from "@/components/navigation/MonthNavigator";
import { TabBar } from "@/components/navigation/TabBar";
import { SummaryBar } from "@/components/transactions/SummaryBar";
import { TransactionList } from "@/components/transactions/TransactionList";
import { MensuelList } from "@/components/mensuel/MensuelList";
import { ComptesSummary } from "@/components/resume/ResumeView";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { useTransactions } from "@/hooks/useTransactions";
import { AddTransactionSheet } from "@/components/forms/AddTransactionSheet";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";
import "@/styles/tokens.css";

interface PageWrapperProps {
  isDark: boolean;
  isMobile: boolean;
  toggleTheme: () => void;
}

export default function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = React.use(params);

  return (
    <ProtectedRoute locale={locale}>
      <PageWrapper>
        {({ isDark, isMobile, toggleTheme }: PageWrapperProps) => (
          <MainContent
            isDark={isDark}
            isMobile={isMobile}
            toggleTheme={toggleTheme}
            locale={locale}
          />
        )}
      </PageWrapper>
    </ProtectedRoute>
  );
}

function MainContent({
  isDark,
  isMobile,
  toggleTheme,
  locale,
}: PageWrapperProps & { locale: string }) {
  const [activeTab, setActiveTab] = useState("quotidien");
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(3);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState({
    type: null, // 'income' | 'expense' | 'transfer' | null
    categoryId: null as number | null,
    accountId: null as number | null,
    month: null as number | null,
  });

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== null,
  ).length;

  const {
    totals,
    groupedByDay,
    isEmpty,
    addTransaction,
    addTransfer,
    deleteTransaction,
    updateTransaction,
    refresh,
  } = useTransactions(year, month);

  const handleAddClick = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleTransactionClick = (transaction: any) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const goToPrevious = () => {
    if (activeTab === "mensuel") {
      setYear((y) => y - 1);
    } else {
      if (month === 1) {
        setMonth(12);
        setYear((y) => y - 1);
      } else setMonth((m) => m - 1);
    }
  };

  const goToNext = () => {
    if (activeTab === "mensuel") {
      setYear((y) => y + 1);
    } else {
      if (month === 12) {
        setMonth(1);
        setYear((y) => y + 1);
      } else setMonth((m) => m + 1);
    }
  };

  const goToPeriod = (y: number, m: number) => {
    setYear(y);
    setMonth(m);
    setActiveTab("quotidien");
  };

  const fabSize = isMobile ? "72px" : "64px";
  const sidebarWidth = isMobile ? "0px" : "260px";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      {!isMobile && (
        <Sidebar activeTab="transactions" locale={locale} />
      )}

      <div
        style={{
          marginLeft: sidebarWidth,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}>
        <TopHeader
          title="Transactions"
          isDark={isDark}
          onToggleTheme={toggleTheme}
          isMobile={isMobile}
          onFilterClick={() => setShowFilterPanel(!showFilterPanel)}
          activeFiltersCount={activeFiltersCount}
        />

        {showFilterPanel && (
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            onClose={() => setShowFilterPanel(false)}
            isMobile={isMobile}
          />
        )}

        <MonthNavigator
          year={year}
          month={month}
          onPrevious={goToPrevious}
          onNext={goToNext}
          variant={activeTab === "mensuel" ? "year" : "month"}
          isMobile={isMobile}
        />

        <TabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isMobile={isMobile}
        />

        <SummaryBar
          totals={totals}
          isMobile={isMobile}
          filters={filters}
          groupedTransactions={groupedByDay}
        />

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            position: "relative",
            paddingBottom: isMobile ? "72px" : "0px",
          }}>
          {activeTab === "quotidien" && (
            <>
              <TransactionList
                groupedTransactions={groupedByDay}
                isDesktop={!isMobile}
                onAddClick={handleAddClick}
                onTransactionClick={handleTransactionClick}
                filters={filters}
              />
            </>
          )}

          {activeTab === "mensuel" && (
            <>
              <MensuelList
                key={refreshKey}
                year={year}
                onGoToPeriod={goToPeriod}
                onAddClick={() => setShowForm(true)}
                isDesktop={!isMobile}
              />
            </>
          )}

          {activeTab === "resume" && (
            <>
              <ComptesSummary
                key={refreshKey}
                year={year}
                month={month}
                isDesktop={!isMobile}
              />
            </>
          )}
        </div>
      </div>

      <button
        onClick={() => setShowForm(true)}
        style={{
          position: "fixed",
          bottom: isMobile ? "88px" : "32px",
          right: "24px",
          width: fabSize,
          height: fabSize,
          borderRadius: "50%",
          backgroundColor: "var(--accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(255, 90, 60, 0.4)",
          zIndex: 40,
        }}>
        <Plus size={isMobile ? 32 : 28} color="#FFF" />
      </button>

      {isMobile && (
        <BottomNav
          activeTab="transactions"
          locale={locale}
        />
      )}

      <AddTransactionSheet
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingTransaction(null);
        }}
        isMobile={isMobile}
        isEditMode={!!editingTransaction}
        existingTransaction={editingTransaction}
        onSubmit={async (data) => {
          if (editingTransaction) {
            try {
              if (editingTransaction.type === 'transfer') {
                await updateTransaction(
                  editingTransaction.id,
                  {
                    amount: Math.abs(parseFloat(data.amount)),
                    description: data.description,
                    date: data.date,
                    fromAccountId: data.fromAccountId,
                    toAccountId: data.toAccountId,
                  },
                  'transfer',
                );
              } else {
                await updateTransaction(
                  editingTransaction.id,
                  {
                    amount: Math.abs(parseFloat(data.amount)),
                    description: data.description,
                    date: data.date,
                    categoryId: data.categoryId,
                    accountId: data.accountId,
                  },
                  editingTransaction.type,
                );
              }
              toast("Transaction mise à jour", { duration: 2000 });
              refresh();
              setRefreshKey((k) => k + 1);
            } catch (err: any) {
              toast(err.message || "Erreur lors de la mise à jour", {
                duration: 3000,
              });
              return;
            }
          } else {
            if (data.type === "transfer") {
              try {
                await addTransfer({
                  amount: data.amount,
                  description: data.description,
                  date: data.date,
                  currencyId: 1,
                  fromAccountId: data.fromAccountId,
                  toAccountId: data.toAccountId,
                });
                toast("Transfert créé", { duration: 2000 });
                refresh();
                setRefreshKey((k) => k + 1);
              } catch (err: any) {
                toast(
                  err.message || "Erreur lors de la création du transfert",
                  { duration: 3000 },
                );
                return;
              }
            } else {
              try {
                await addTransaction(data);
                toast("Transaction créée", { duration: 2000 });
                refresh();
                setRefreshKey((k) => k + 1);
              } catch (err: any) {
                toast(err.message || "Erreur lors de la création", {
                  duration: 3000,
                });
                return;
              }
            }
          }
        }}
        onDelete={async (id, type) => {
          await deleteTransaction(id, type);
          refresh();
          setRefreshKey((k) => k + 1);
          setShowForm(false);
          setEditingTransaction(null);
          toast("Transaction supprimée", { duration: 2000 });
        }}
      />
    </div>
  );
}
