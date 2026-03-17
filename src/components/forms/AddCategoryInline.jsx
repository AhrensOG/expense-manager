'use client';

import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const EMOJI_OPTIONS = ['🍎', '🚗', '💊', '🎬', '🏠', '🎁', '🍽️', '👕', '📄', '📦', '✈️', '🎓'];

export const AddCategoryInline = ({ onAdd, onBack }) => {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📦');

  const handleSave = () => {
    if (!name.trim()) return;
    const id = name.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    onAdd({ id, label: name, emoji });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ 
        padding: '16px 20px', 
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px',
            color: 'var(--accent)',
            minHeight: '48px',
            padding: '8px 0',
          }}
        >
          <ChevronLeft size={24} />
          Retour
        </button>
      </div>

      <div style={{ padding: '24px 20px', flex: 1, overflow: 'auto' }}>
        {/* Name Input */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Nom de la catégorie
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nom de la catégorie"
            autoFocus
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '16px',
              backgroundColor: 'var(--bg)',
              borderRadius: '12px',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Emoji Picker */}
        <div>
          <label style={{ display: 'block', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Icône
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {EMOJI_OPTIONS.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                style={{
                  width: '48px',
                  height: '48px',
                  fontSize: '24px',
                  borderRadius: '12px',
                  backgroundColor: emoji === e ? 'var(--accent)' : 'var(--bg)',
                  border: emoji === e ? 'none' : '1px solid var(--border)',
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          backgroundColor: 'var(--bg)', 
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '32px' }}>{emoji}</span>
          <span style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-primary)' }}>
            {name || 'Aperçu'}
          </span>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: name.trim() ? 'var(--accent)' : 'var(--border)',
            color: '#FFF',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            minHeight: '56px',
            opacity: name.trim() ? 1 : 0.5,
          }}
        >
          Sauvegarder
        </button>
      </div>
    </div>
  );
};
