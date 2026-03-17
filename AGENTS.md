# AGENTS.md - Geneva Expense Manager

This file contains guidelines for AI agents working in this repository.

## Project Overview

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS 4
- **i18n**: next-intl (EN/FR)
- **Database**: PostgreSQL with Sequelize ORM
- **Auth**: next-auth

---

## Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build       # Production build
npm run start       # Start production server
npm run lint        # Run ESLint
npm run db:init     # Initialize database
```

### Running Tests
There are currently no tests in this project. To add tests:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

To run a single test file when tests are added:
```bash
npx vitest run src/__tests__/specific-test.test.ts
# or
npm test -- --testPathPattern=specific-test
```

---

## Code Style Guidelines

### General Principles
- Write clean, readable, and maintainable code
- Prefer explicit over implicit
- Keep functions small and focused (single responsibility)
- Use meaningful variable and function names

### TypeScript
- Always define proper types for props, state, and function parameters
- Avoid `any` - use `unknown` if type is truly unknown
- Use interfaces for object shapes, types for unions/aliases
- Enable strict mode in tsconfig.json

```typescript
// Good
interface Transaction {
  id: number;
  amount: number;
  category: string;
  date: string;
}

// Avoid
const tx: any = { ... };
```

### Imports
- Use absolute imports with `@/` prefix (configured in tsconfig.json)
- Group imports in this order:
  1. React/Next imports
  2. Third-party libraries
  3. Absolute imports (@/...)
  4. Relative imports (./, ../)
- Use named exports over default exports where possible

```typescript
// Preferred
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Plus, X, Wallet } from 'lucide-react';
import { BottomNav } from '@/components/Navigation';
import { formatAmount } from '@/lib/utils';
```

### Naming Conventions
- **Components**: PascalCase (e.g., `TransactionList`, `SummaryCard`)
- **Functions/variables**: camelCase (e.g., `handleSubmit`, `formData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `ACCENT_COLOR`, `MAX_AMOUNT`)
- **Files**: kebab-case (e.g., `transaction-list.tsx`, `utils.ts`)
- **Booleans**: Use `is`, `has`, `can` prefixes (e.g., `isActive`, `hasError`)

### React/Next.js Patterns
- Use `'use client'` directive for client-side components
- Keep server components as default, extract client interactivity
- Use proper TypeScript types for useState generics
- Memoize expensive computations with `useMemo` and callbacks with `useCallback`
- Handle loading and error states appropriately

```typescript
// Good - with proper types
const [formData, setFormData] = useState<FormData>({
  amount: '',
  category: '',
  description: '',
});

// Good - client component directive
'use client';

import { useState } from 'react';
```

### TailwindCSS
- Use responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`)
- Use arbitrary values sparingly
- Group related classes logically
- Use the design system colors defined in components (ACCENT_COLOR, INCOME_COLOR, etc.)

```typescript
// Good - responsive classes
<div className="px-4 lg:px-8 py-4 lg:py-6">

// Good - using design tokens
<button style={{ backgroundColor: ACCENT_COLOR }}>
```

### Error Handling
- Always handle async errors with try/catch
- Use Sonner toasts for user feedback
- Validate form inputs before submission
- Show meaningful error messages to users

```typescript
// Good
try {
  await saveTransaction(formData);
  toast.success('Transaction saved!');
} catch (error) {
  toast.error('Failed to save transaction');
  console.error(error);
}
```

### File Structure
```
src/
├── app/                 # Next.js App Router pages
│   ├── [locale]/       # Internationalized routes
│   │   ├── page.tsx    # Home/Transactions page
│   │   ├── accounts/  # Accounts page
│   │   ├── statistics/ # Statistics page
│   │   └── layout.tsx # Locale layout
│   ├── api/            # API routes
│   └── globals.css    # Global styles
├── components/         # Reusable UI components
├── i18n/              # Internationalization config
├── lib/               # Utilities and helpers
└── messages/          # Translation files (en.json, fr.json)
```

### Internationalization (i18n)
- Use `next-intl` for translations
- Translation keys go in `messages/en.json` and `messages/fr.json`
- Use `useTranslations()` hook in client components
- Structure keys by feature (e.g., `Home.title`, `Nav.accounts`)

### Database
- Use Sequelize ORM for database operations
- Define models in appropriate files
- Use environment variables for sensitive data
- Never commit `.env` file

---

## Working on This Project

### Adding a New Page
1. Create route in `src/app/[locale]/[page]/page.tsx`
2. Add navigation link in `src/components/Navigation.tsx`
3. Add translation keys to `messages/en.json` and `messages/fr.json`

### Adding a New Component
1. Create file in appropriate location under `src/components/`
2. Export as named export
3. Import and use in pages
4. Follow the design system colors and spacing

### Adding Translations
1. Add key to both `messages/en.json` and `messages/fr.json`
2. Use `t('key.path')` in components

---

## Common Issues

- **Type errors**: Run `npm run build` to check for type errors
- **Lint errors**: Run `npm run lint` to check for linting issues
- **Hydration errors**: Ensure client components have proper `use client` directive
- **i18n issues**: Ensure locale is passed correctly in links

---

## Design System Reference

| Token | Value | Usage |
|-------|-------|-------|
| ACCENT_COLOR | #FF5A3C | Primary action, coral |
| INCOME_COLOR | #4A90D9 | Income values, blue |
| BG_COLOR | #F2F2F7 | Page background |
| CARD_BG | #FFFFFF | Card backgrounds |
| TEXT_PRIMARY | #1C1C1E | Primary text |
| MUTED_COLOR | #8E8E93 | Secondary text |
| BORDER_COLOR | #E5E5EA | Borders and dividers |

Font size minimum: 15px (for accessibility - elderly users)
Touch targets minimum: 48x48px
