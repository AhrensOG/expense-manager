'use client';

import { useState } from 'react';
import { ChevronDown, ArrowRightLeft } from 'lucide-react';
import { AccountSelector } from './AccountSelector';
import { categories, paymentMethods } from '@/data/mockData';

const TABS = [
  { id: 'expense', label: 'Dépense', color: 'var(--accent)' },
  { id: 'income', label: 'Revenu', color: 'var(--income)' },
  { id: 'transfer', label: 'Transfert', color: 'var(--text-secondary)' },
];

export const TransactionForm = ({ formData, updateField, onSelectCategory, onClose, isMobile }) => {
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [accountPickerType, setAccountPickerType] = useState('method');

  const { categories, paymentMethods } = getFormOptions(formData.type);
  const selectedCategory = categories.find(c => c.id === formData.category);
  const selectedMethod = paymentMethods.find(m => m.id === formData.method);

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleAccountSelect = (accountId) => {
    if (accountPickerType === 'method') {
      updateField('method', accountId);
    } else if (accountPickerType === 'from') {
      updateField('fromMethod', accountId);
    } else if (accountPickerType === 'to') {
      updateField('toMethod', accountId);
    }
    setShowAccountPicker(false);
  };

  return (
    <div style={{ padding: '20px', overflow: 'auto', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>
          {formData.type === 'transfer' ? 'Nouveau transfert' : 'Nouvelle dépense'}
        </h2>
        <button onClick={onClose} style={{ minWidth: '44px', minHeight: '44px', fontSize: '18px' }}>✕</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', backgroundColor: 'var(--bg)', borderRadius: '16px', padding: '4px' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => updateField('type', tab.id)}
            style={{
              flex: 1,
              padding: '14px 8px',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '14px',
              backgroundColor: formData.type === tab.id ? tab.color : 'transparent',
              color: formData.type === tab.id ? '#FFF' : 'var(--text-secondary)',
              minHeight: '48px',
            }}
          >
            {tab.id === 'transfer' ? <ArrowRightLeft size={16} style={{ marginRight: '4px', display: 'inline' }} /> : null}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          inputMode="decimal"
          value={formData.amount}
          onChange={e => updateField('amount', e.target.value)}
          placeholder="0,00"
          style={{
            width: '100%',
            padding: '20px',
            fontSize: '32px',
            fontWeight: '700',
            textAlign: 'center',
            backgroundColor: 'var(--bg)',
            borderRadius: '16px',
            color: 'var(--text-primary)',
            borderBottom: '3px solid var(--accent)',
          }}
        />
        <div style={{ textAlign: 'center', marginTop: '8px', color: 'var(--text-secondary)' }}>CHF</div>
      </div>

      {/* Date */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Date</label>
        <input
          type="date"
          value={formData.date}
          onChange={e => updateField('date', e.target.value)}
          style={{
            width: '100%',
            padding: '14px 16px',
            fontSize: '15px',
            backgroundColor: 'var(--bg)',
            borderRadius: '12px',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Transfer-specific fields */}
      {formData.type === 'transfer' ? (
        <>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>De</label>
            <button
              onClick={() => { setAccountPickerType('from'); setShowAccountPicker(true); }}
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '15px',
                backgroundColor: 'var(--bg)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: '48px',
              }}
            >
              <span>{paymentMethods.find(m => m.id === formData.fromMethod)?.label || 'Sélectionner'}</span>
              <ChevronDown size={18} />
            </button>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Vers</label>
            <button
              onClick={() => { setAccountPickerType('to'); setShowAccountPicker(true); }}
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '15px',
                backgroundColor: 'var(--bg)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: '48px',
              }}
            >
              <span>{paymentMethods.find(m => m.id === formData.toMethod)?.label || 'Sélectionner'}</span>
              <ChevronDown size={18} />
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Category */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Catégorie</label>
            <button
              onClick={onSelectCategory}
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '15px',
                backgroundColor: 'var(--bg)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: '48px',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {selectedCategory?.emoji} {selectedCategory?.label || 'Sélectionner'}
              </span>
              <ChevronDown size={18} />
            </button>
          </div>

          {/* Account */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Compte</label>
            <button
              onClick={() => { setAccountPickerType('method'); setShowAccountPicker(true); }}
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '15px',
                backgroundColor: 'var(--bg)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: '48px',
              }}
            >
              <span>{selectedMethod?.label || 'Sélectionner'}</span>
              <ChevronDown size={18} />
            </button>
          </div>
        </>
      )}

      {/* Note */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Note (optionnel)</label>
        <input
          type="text"
          value={formData.note}
          onChange={e => updateField('note', e.target.value)}
          placeholder="Ajouter une note..."
          style={{
            width: '100%',
            padding: '14px 16px',
            fontSize: '15px',
            backgroundColor: 'var(--bg)',
            borderRadius: '12px',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Submit */}
      <button
        onClick={onClose}
        style={{
          width: '100%',
          padding: '18px',
          backgroundColor: 'var(--accent)',
          color: '#FFF',
          borderRadius: '16px',
          fontSize: '16px',
          fontWeight: '600',
          minHeight: '56px',
        }}
      >
        {formData.type === 'transfer' ? 'Enregistrer le transfert' : 'Enregistrer'}
      </button>

      {showAccountPicker && (
        <AccountSelector
          accounts={paymentMethods}
          selected={accountPickerType === 'from' ? formData.fromMethod : accountPickerType === 'to' ? formData.toMethod : formData.method}
          onSelect={handleAccountSelect}
          onClose={() => setShowAccountPicker(false)}
        />
      )}
    </div>
  );
};

function getFormOptions(type) {
  if (type === 'income') {
    return {
      categories: categories.filter(c => c.id === 'revenu'),
      paymentMethods,
    };
  }
  return {
    categories: categories.filter(c => c.id !== 'revenu'),
    paymentMethods,
  };
}
