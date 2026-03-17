'use client';

import { useRouter } from 'next/navigation';
import { List, BarChart3, Settings, Wallet } from 'lucide-react';

export const BottomNav = ({ activeTab, locale = 'fr' }) => {
  const router = useRouter();
  
  const navItems = [
    { id: 'transactions', icon: List, label: 'Transactions', href: `/${locale}` },
    { id: 'comptes', icon: Wallet, label: 'Comptes', href: `/${locale}/comptes` },
    { id: 'statistiques', icon: BarChart3, label: 'Statistiques', href: `/${locale}/statistiques` },
    { id: 'reglages', icon: Settings, label: 'Réglages', href: `/${locale}/reglages` },
  ];
  
  const isActive = (id) => activeTab === id;

  const handleClick = (item) => {
    router.push(item.href);
  };
  
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '72px',
      backgroundColor: 'var(--card-bg)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 40,
    }}>
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => handleClick(item)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            padding: '8px 16px',
            minWidth: '64px',
            minHeight: '48px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <item.icon 
            size={28} 
            color={isActive(item.id) ? 'var(--accent)' : 'var(--text-secondary)'} 
          />
          <span style={{
            fontSize: '12px',
            fontWeight: isActive(item.id) ? '600' : '400',
            color: isActive(item.id) ? 'var(--accent)' : 'var(--text-secondary)',
          }}>
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
};
