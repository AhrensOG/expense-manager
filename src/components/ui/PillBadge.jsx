export const PillBadge = ({ children, variant = 'default' }) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
  };
  
  const variants = {
    default: { backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)' },
    accent: { backgroundColor: 'var(--accent)', color: '#FFFFFF' },
    today: { backgroundColor: 'var(--accent)', color: '#FFFFFF' },
  };
  
  return (
    <span style={{ ...baseStyle, ...variants[variant] }}>
      {children}
    </span>
  );
};
