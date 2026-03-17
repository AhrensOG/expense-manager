'use client';

import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { AddCategoryInline } from './AddCategoryInline';
import { categories as allCategories } from '@/data/mockData';

export const CategorySelector = ({ selected, onSelect, onBack, isMobile, categories: passedCategories }) => {
  const defaultCategories = allCategories.filter(c => c.id !== 'revenu');
  const categories = passedCategories || defaultCategories;
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categoriesList, setCategoriesList] = useState(categories);

  const handleAddCategory = (newCat) => {
    setCategoriesList(prev => [...prev, newCat]);
    setShowAddCategory(false);
    onSelect(newCat.id);
  };

  if (showAddCategory) {
    return (
      <AddCategoryInline
        onAdd={handleAddCategory}
        onBack={() => setShowAddCategory(false)}
      />
    );
  }

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

      {/* Grid */}
      <div style={{ 
        flex: 1, 
        overflow: 'auto', 
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        alignContent: 'start',
      }}>
        {categoriesList.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px 8px',
              borderRadius: '16px',
              backgroundColor: selected === cat.id ? 'var(--accent)' : 'var(--bg)',
              minHeight: '90px',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '32px' }}>{cat.emoji}</span>
            <span style={{ 
              fontSize: '12px', 
              fontWeight: '500',
              color: selected === cat.id ? '#FFF' : 'var(--text-primary)',
              textAlign: 'center',
            }}>
              {cat.label}
            </span>
          </button>
        ))}
      </div>

      {/* Add Category Button */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <button
          onClick={() => setShowAddCategory(true)}
          style={{
            width: '100%',
            padding: '16px',
            border: '2px dashed var(--accent)',
            borderRadius: '16px',
            color: 'var(--accent)',
            fontSize: '15px',
            fontWeight: '600',
            backgroundColor: 'transparent',
            minHeight: '56px',
          }}
        >
          + Ajouter une catégorie
        </button>
      </div>
    </div>
  );
};
