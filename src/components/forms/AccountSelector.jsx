'use client';

export const AccountSelector = ({ accounts, selected, onSelect, onClose }) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 60,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: 'var(--card-bg)',
          borderRadius: '24px 24px 0 0',
          padding: '20px',
          maxHeight: '60vh',
          overflow: 'auto',
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-primary)' }}>
          Choisir un compte
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {accounts.map(account => (
            <button
              key={account.id}
              onClick={() => onSelect(account.id)}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: selected === account.id ? 'var(--accent)' : 'var(--bg)',
                borderRadius: '12px',
                color: selected === account.id ? '#FFF' : 'var(--text-primary)',
                fontSize: '16px',
                fontWeight: '500',
                textAlign: 'left',
                minHeight: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {account.label}
              {selected === account.id && <span>✓</span>}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '16px',
            marginTop: '12px',
            backgroundColor: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            color: 'var(--text-secondary)',
            fontSize: '15px',
            minHeight: '48px',
          }}
        >
          Annuler
        </button>
      </div>
    </div>
  );
};
