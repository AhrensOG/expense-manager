'use client';

import { useRouter } from 'next/navigation';

export const SettingsRow = ({ 
  icon: Icon, 
  label, 
  subtitle, 
  rightElement,
  onClick,
  showBadge = false,
  badgeEnabled = false
}) => {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: '64px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        background: 'none',
        border: 'none',
        borderBottom: '1px solid var(--border)',
        cursor: onClick ? 'pointer' : 'default',
        textAlign: 'left',
      }}
    >
      {Icon && (
        <Icon size={22} color="var(--text-secondary)" />
      )}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span style={{
          fontSize: '17px',
          fontWeight: '600',
          color: 'var(--text-primary)',
        }}>
          {label}
        </span>
        {subtitle && (
          <span style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
          }}>
            {subtitle}
          </span>
        )}
      </div>
      {rightElement || (showBadge ? (
        <span style={{
          fontSize: '13px',
          fontWeight: '700',
          padding: '4px 10px',
          borderRadius: '20px',
          backgroundColor: badgeEnabled ? 'rgba(52, 199, 89, 0.15)' : 'rgba(255, 90, 60, 0.15)',
          color: badgeEnabled ? '#34C759' : 'var(--accent)',
        }}>
          {badgeEnabled ? 'ON' : 'OFF'}
        </span>
      ) : null)}
    </button>
  );
};
