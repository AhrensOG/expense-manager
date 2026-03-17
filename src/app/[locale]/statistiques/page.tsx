'use client';

import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { StatistiquesPage } from '@/components/statistiques/StatistiquesPage';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import '@/styles/tokens.css';

interface PageWrapperProps {
  isDark: boolean;
  isMobile: boolean;
  toggleTheme: () => void;
}

export default function StatistiquesPageRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = React.use(params);
  
  return (
    <ProtectedRoute locale={locale}>
      <PageWrapper>
        {({ isDark, isMobile, toggleTheme }: PageWrapperProps) => (
          <MainContent isDark={isDark} isMobile={isMobile} toggleTheme={toggleTheme} locale={locale} />
        )}
      </PageWrapper>
    </ProtectedRoute>
  );
}

function MainContent({ isDark, isMobile, toggleTheme, locale }: PageWrapperProps & { locale: string }) {
  const [periodMode, setPeriodMode] = useState('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const sidebarWidth = isMobile ? '0px' : '260px';

  const showCustomDates = periodMode === 'custom';
  
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {!isMobile && (
        <Sidebar activeTab="statistiques" locale={locale} />
      )}
      
      <div style={{ marginLeft: sidebarWidth, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopHeader 
          title="Statistiques" 
          isDark={isDark} 
          onToggleTheme={toggleTheme} 
          isMobile={isMobile}
          variant="statistiques"
          periodMode={periodMode}
          onPeriodModeChange={setPeriodMode}
        />

        {showCustomDates && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              padding: '16px 24px',
              backgroundColor: 'var(--card-bg)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Début
              </div>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: customStartDate ? '1px solid #FF5A3C' : '1px solid var(--border)',
                  backgroundColor: 'var(--bg)',
                  color: customStartDate ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: '14px',
                  minHeight: '44px',
                  cursor: 'pointer',
                }}
              />
            </div>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Fin
              </div>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: customEndDate ? '1px solid #FF5A3C' : '1px solid var(--border)',
                  backgroundColor: 'var(--bg)',
                  color: customEndDate ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: '14px',
                  minHeight: '44px',
                  cursor: 'pointer',
                }}
              />
            </div>
          </div>
        )}
        
        <StatistiquesPage 
          isMobile={isMobile} 
          periodMode={periodMode}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
        />
      </div>
      
      {isMobile && (
        <BottomNav activeTab="statistiques" locale={locale} />
      )}
    </div>
  );
}
