'use client';

import { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';

export const SearchBar = ({ isMobile = false, isExpanded = false, onExpand }) => {
  if (isMobile) {
    if (!isExpanded) return null;
    return (
      <div style={{
        padding: '12px 16px',
        backgroundColor: 'var(--text-primary)',
      }}>
        <input
          type="text"
          placeholder="Rechercher..."
          autoFocus
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--card-bg)',
            color: 'var(--text-primary)',
            fontSize: '15px',
          }}
        />
      </div>
    );
  }
  
  return (
    <div style={{ position: 'relative', width: '240px' }}>
      <SearchIcon 
        size={20} 
        style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-secondary)',
        }} 
      />
      <input
        type="text"
        placeholder="Rechercher..."
        style={{
          width: '100%',
          padding: '12px 16px 12px 48px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg)',
          color: 'var(--text-primary)',
          fontSize: '15px',
        }}
      />
    </div>
  );
};
