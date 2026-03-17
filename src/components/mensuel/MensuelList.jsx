'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useAllTransactions } from '@/hooks/useTransactions';
import { EmptyState } from '@/components/ui/EmptyState';

const months = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const monthAbbr = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'];

const formatAmount = (amount) => {
  return Math.abs(amount).toLocaleString('de-DE', { minimumFractionDigits: 2 }) + ' CHF';
};

export const MensuelList = ({ year, onGoToPeriod, onAddClick, isDesktop = false }) => {
  const isMobile = !isDesktop;
  const { groupedByMonth, loading } = useAllTransactions(year);
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const fontSize = isMobile ? "15px" : "18px";
  const fontSizeSmall = isMobile ? "13px" : "15px";
  const fontSizeAmount = isMobile ? "14px" : "15px";
  const paddingMonth = isMobile ? "14px 16px" : "20px 24px";
  const paddingWeek = isMobile ? "12px 14px" : "16px 24px";
  
  // Get months to show based on year and transactions
  const getMonthsToShow = () => {
    // Get months that have transactions ONLY for the current year
    const monthsWithTx = groupedByMonth
      .filter(g => g.month.startsWith(year.toString()))
      .map(g => parseInt(g.month.split('-')[1]));
    
    if (year > currentYear) {
      // Future year: only show months with transactions
      return [...new Set(monthsWithTx)].sort((a, b) => b - a);
    } else if (year === currentYear) {
      // Current year: past months + months with transactions
      const pastMonths = Array.from({ length: currentMonth }, (_, i) => i + 1);
      const allMonths = new Set([...pastMonths, ...monthsWithTx]);
      return [...allMonths].sort((a, b) => b - a);
    } else {
      // Past year: all 12 months
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    }
  };
  
  const monthsToShow = getMonthsToShow();
  
  // Initialize expanded month - start with first available month
  const [expandedMonth, setExpandedMonth] = useState(null);
  
  const padding = isDesktop ? '24px' : '16px';
  
  const allMonthsData = useMemo(() => {
    return monthsToShow.map(monthNum => {
      const monthKey = `${year}-${String(monthNum).padStart(2, '0')}`;
      const monthTx = groupedByMonth.find(g => g.month === monthKey)?.transactions || [];
      
      const income = monthTx
        .filter(t => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0);
      const expenses = monthTx
        .filter(t => t.type === 'expense')
        .reduce((s, t) => s + Math.abs(t.amount), 0);
      
      return {
        monthNum,
        monthKey,
        transactions: monthTx,
        income,
        expenses,
        balance: income - expenses,
      };
    });
  }, [year, groupedByMonth, monthsToShow]);

  const toggleMonth = (monthNum) => {
    setExpandedMonth(prev => prev === monthNum ? null : monthNum);
  };

  const getMonthWeeks = (monthNum) => {
    // First day of the month at midnight UTC
    const start = Date.UTC(year, monthNum - 1, 1);
    // Last day of the month at midnight UTC
    const end = Date.UTC(year, monthNum, 0);
    const weeks = [];
    let current = start;
    
    while (current <= end) {
      const weekEnd = current + (6 * 24 * 60 * 60 * 1000);
      const finalEnd = weekEnd > end ? end : weekEnd;
      weeks.push({ start: new Date(current), end: new Date(finalEnd) });
      current = finalEnd + (24 * 60 * 60 * 1000);
    }
    return weeks;
  };

  const formatWeekRange = (start, end) => {
    return `${start.getDate()}/${start.getMonth() + 1} ~ ${end.getDate()}/${end.getMonth() + 1}`;
  };

  const formatMonthRange = (monthNum) => {
    const start = `1/${monthNum}`;
    const end = new Date(year, monthNum, 0).getDate();
    return `${start} ~ ${end}/${monthNum}`;
  };

  const isCurrentWeek = (weekStart, weekEnd) => {
    const now = new Date();
    const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    return nowUTC >= weekStart.getTime() && nowUTC <= weekEnd.getTime();
  };

  const hasTransactions = (monthData) => monthData.transactions.length > 0;

  if (loading) {
    return (
      <div style={{ padding, textAlign: 'center', color: 'var(--text-secondary)' }}>
        Chargement...
      </div>
    );
  }

  return (
    <div style={{ padding }}>
      {allMonthsData.map((monthData) => {
        const isExpanded = expandedMonth === monthData.monthNum;
        const textColor = hasTransactions(monthData) ? 'var(--text-primary)' : 'var(--text-secondary)';
        
        return (
          <div key={monthData.monthKey} style={{ marginBottom: '8px' }}>
            {/* Month Header */}
            <button
              onClick={() => toggleMonth(monthData.monthNum)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: paddingMonth,
                backgroundColor: 'var(--card-bg)',
                borderRadius: isDesktop ? '12px' : '8px',
                textAlign: 'left',
                minHeight: '56px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ChevronDown 
                  size={isMobile ? 18 : 20} 
                  style={{ 
                    transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                    transition: 'transform 0.2s',
                    color: 'var(--text-secondary)',
                  }} 
                />
                <div>
                  <div style={{ fontSize, fontWeight: '600', color: textColor }}>
                    {monthAbbr[monthData.monthNum - 1]}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {formatMonthRange(monthData.monthNum)}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: fontSizeSmall, color: '#4A90D9' }}>
                    {formatAmount(monthData.income)}
                  </div>
                  <div style={{ fontSize: fontSizeSmall, color: '#FF5A3C' }}>
                    -{formatAmount(monthData.expenses)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {formatAmount(monthData.balance)}
                  </div>
                </div>
              </div>
            </button>

            {/* Weeks (expanded) */}
            {isExpanded && (
              <div style={{ 
                paddingLeft: isMobile ? '8px' : '16px', 
                marginTop: '4px',
              }}>
                {[...getMonthWeeks(monthData.monthNum)].reverse().map((week, idx) => {
                  const weekTx = monthData.transactions.filter(tx => {
                    const txDate = new Date(tx.date);
                    const txDateUTC = Date.UTC(txDate.getUTCFullYear(), txDate.getUTCMonth(), txDate.getUTCDate());
                    const weekStartUTC = week.start.getTime();
                    const weekEndUTC = week.end.getTime();
                    return txDateUTC >= weekStartUTC && txDateUTC <= weekEndUTC;
                  });
                  
                  const weekIncome = weekTx
                    .filter(t => t.type === 'income')
                    .reduce((s, t) => s + t.amount, 0);
                  const weekExpenses = weekTx
                    .filter(t => t.type === 'expense')
                    .reduce((s, t) => s + Math.abs(t.amount), 0);
                  const weekBalance = weekIncome - weekExpenses;
                  
                  const isCurrent = isCurrentWeek(week.start, week.end);
                  const isDark = typeof window !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => onGoToPeriod(year, monthData.monthNum)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: paddingWeek,
                        backgroundColor: isCurrent 
                          ? (isDark ? '#5C1A10' : '#FFE8E4') 
                          : 'var(--bg)',
                        borderRadius: isDesktop ? '10px' : '6px',
                        marginBottom: '4px',
                        textAlign: 'left',
                        minHeight: '48px',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontSize: fontSizeSmall, color: 'var(--text-primary)', flex: isMobile ? 1 : 'none' }}>
                        {formatWeekRange(week.start, week.end)}
                      </span>
                      <div style={{ display: 'flex', gap: isMobile ? '8px' : '16px', alignItems: 'center' }}>
                        <span style={{ fontSize: fontSizeAmount, color: '#4A90D9', minWidth: isMobile ? '60px' : '80px', textAlign: 'right' }}>
                          {formatAmount(weekIncome)}
                        </span>
                        <span style={{ fontSize: fontSizeAmount, color: '#FF5A3C', minWidth: isMobile ? '60px' : '80px', textAlign: 'right' }}>
                          -{formatAmount(weekExpenses)}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', minWidth: isMobile ? '60px' : '80px', textAlign: 'right' }}>
                          {formatAmount(weekBalance)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      
      {monthsToShow.length === 0 && (
        <EmptyState
          message={`Aucune donnée pour ${year}`}
          showButton
          onAddClick={onAddClick}
        />
      )}
      
      {monthsToShow.length > 0 && allMonthsData.every(m => m.transactions.length === 0) && (
        <EmptyState
          message="Aucune transaction pour cette année"
          showButton
          onAddClick={onAddClick}
        />
      )}
    </div>
  );
};
