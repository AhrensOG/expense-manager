'use client';

import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { TopHeader } from '@/components/layout/TopHeader';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { ComptesPage } from '@/components/comptes/ComptesPage';
import { AddAccountSheet } from '@/components/comptes/AddAccountSheet';
import { CompteDetailPage } from '@/components/comptes/CompteDetailPage';
import { accounts as allAccounts } from '@/data/mockData';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import '@/styles/tokens.css';

export default function ComptesPageRoute({ params }: { params: Promise<{ locale: string }> }) {
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

interface PageWrapperProps {
  isDark: boolean;
  isMobile: boolean;
  toggleTheme: () => void;
}

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
}

function MainContent({ isDark, isMobile, toggleTheme, locale }: PageWrapperProps & { locale: string }) {
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleSelectAccount = (account: any) => {
    setSelectedAccountId(account.id);
  };

  const handleAddAccount = (account: any) => {
    console.log('Added account:', account);
    setRefreshKey(k => k + 1);
  };

  const sidebarWidth = isMobile ? '0px' : '260px';
  
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {!isMobile && (
        <Sidebar activeTab="comptes" locale={locale} />
      )}
      
      <div style={{ marginLeft: sidebarWidth, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TopHeader
          title="Comptes"
          isDark={isDark}
          onToggleTheme={toggleTheme}
          isMobile={isMobile}
          variant="comptes"
          onAddClick={() => setShowAddAccount(true)}
        />
        
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: isMobile ? '72px' : '0' }}>
          {selectedAccountId ? (
            <CompteDetailPage
              accountId={selectedAccountId}
              onBack={() => setSelectedAccountId(null)}
              isMobile={isMobile}
            />
          ) : (
            <ComptesPage
              key={refreshKey}
              isMobile={isMobile}
              onSelectAccount={handleSelectAccount}
            />
          )}
        </div>
      </div>
      
      {isMobile && (
        <BottomNav activeTab="comptes" locale={locale} />
      )}
      
      <AddAccountSheet
        isOpen={showAddAccount}
        onClose={() => setShowAddAccount(false)}
        onAdd={handleAddAccount}
        isMobile={isMobile}
      />
    </div>
  );
}
