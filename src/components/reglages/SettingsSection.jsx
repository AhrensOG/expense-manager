'use client';

export const SettingsSection = ({ label, children, isDesktop = false }) => {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{
        fontSize: '13px',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: 'var(--text-secondary)',
        padding: isDesktop ? '8px 24px' : '8px 16px',
        backgroundColor: 'var(--bg)',
      }}>
        {label}
      </div>
      <div style={{
        backgroundColor: 'var(--card-bg)',
        borderRadius: isDesktop ? '16px' : '0',
        boxShadow: isDesktop ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  );
};
