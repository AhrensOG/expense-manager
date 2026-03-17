'use client';

import { Toaster, toast } from 'sonner';
import { useState, useEffect } from 'react';

const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return stored === 'dark' || (!stored && prefersDark) ? 'dark' : 'light';
};

export const ThemeToaster = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  useEffect(() => {
    const handleChange = (e: MediaQueryListEvent) => {
      const stored = localStorage.getItem('theme');
      if (!stored) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleChange);

    const storageHandler = () => {
      const stored = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = stored === 'dark' || (!stored && prefersDark);
      setTheme(isDark ? 'dark' : 'light');
    };

    window.addEventListener('storage', storageHandler);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);

  const isDark = theme === 'dark';

  const toastStyle = {
    background: isDark ? '#374151' : '#fff',
    color: isDark ? '#fff' : '#1f2937',
    border: isDark ? '1px solid #4b5563' : '1px solid #e5e7eb',
  };

  return (
    <Toaster 
      position="top-right"
      closeButton
      theme={theme}
      toastOptions={{
        style: toastStyle,
      }}
    />
  );
};
