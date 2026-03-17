'use client';

export const DeleteConfirmation = ({ onConfirm, onCancel }) => {
  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'var(--card-bg)',
      borderRadius: '16px',
      marginTop: '16px',
    }}>
      <p style={{
        fontSize: '15px',
        color: 'var(--text-primary)',
        textAlign: 'center',
        marginBottom: '16px',
      }}>
        Etes-vous sur de vouloir supprimer cette transaction ?
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '14px',
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            color: 'var(--text-primary)',
            fontSize: '15px',
            fontWeight: '500',
          }}
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          style={{
            flex: 1,
            padding: '14px',
            backgroundColor: '#EF4444',
            border: 'none',
            borderRadius: '12px',
            color: '#FFF',
            fontSize: '15px',
            fontWeight: '500',
          }}
        >
          Confirmer la suppression
        </button>
      </div>
    </div>
  );
};
