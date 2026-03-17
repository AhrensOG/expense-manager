import { Plus, Receipt } from 'lucide-react';

export const EmptyState = ({ message = 'Aucune transaction pour cette periode', showButton = false, onAddClick }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      gap: '16px',
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: 'var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
      }}>
        <Receipt size={32} color='var(--text-secondary)' />
      </div>
      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '15px',
        textAlign: 'center',
      }}>
        {message}
      </p>
      {showButton && (
        <button
          onClick={onAddClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: 'var(--accent)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            fontSize: '15px',
            fontWeight: '600',
            marginTop: '8px',
          }}
        >
          <Plus size={20} />
          Ajouter une transaction
        </button>
      )}
    </div>
  );
};
