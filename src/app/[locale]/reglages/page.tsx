'use client';

import React, { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { ReglagesPage } from '@/components/reglages/ReglagesPage';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';
import '@/styles/tokens.css';

export default function ReglagesPageRoute({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = React.use(params);
  
  return (
    <ProtectedRoute locale={locale}>
      <PageWrapper>
        {({ isDark, isMobile, toggleTheme }: PageWrapperProps) => (
          <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
            {!isMobile && (
              <Sidebar activeTab="reglages" locale={locale} />
            )}
            
            <div style={{ 
              marginLeft: isMobile ? '0px' : '260px',
              minHeight: '100vh',
            }}>
              <ReglagesPage 
                isMobile={isMobile} 
                locale={locale}
                isDark={isDark}
                toggleTheme={toggleTheme}
              />
            </div>
            
            {isMobile && (
              <BottomNav activeTab="reglages" locale={locale} />
            )}
          </div>
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
