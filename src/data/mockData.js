export const expenseCategories = [
  { id: 'alimentation', emoji: '🍎', label: 'Alimentation' },
  { id: 'transport', emoji: '🚗', label: 'Transport' },
  { id: 'sante', emoji: '💊', label: 'Santé' },
  { id: 'loisirs', emoji: '🎬', label: 'Loisirs' },
  { id: 'logement', emoji: '🏠', label: 'Logement' },
  { id: 'cadeaux', emoji: '🎁', label: 'Cadeaux' },
  { id: 'restaurants', emoji: '🍽️', label: 'Restaurants' },
  { id: 'vetements', emoji: '👕', label: 'Vêtements' },
  { id: 'factures', emoji: '📄', label: 'Factures' },
  { id: 'autres', emoji: '📦', label: 'Autres' },
];

export const incomeCategories = [
  { id: 'salaire', emoji: '💼', label: 'Salaire' },
  { id: 'retraite', emoji: '🏖️', label: 'Retraite' },
  { id: 'rente', emoji: '📊', label: 'Rente' },
  { id: 'allocations', emoji: '🏛️', label: 'Allocations' },
  { id: 'investissements', emoji: '📈', label: 'Investissements' },
  { id: 'autres_revenus', emoji: '💰', label: 'Autres revenus' },
];

export const categories = [...expenseCategories, ...incomeCategories];

export const paymentMethods = [
  { id: 'especes', label: 'Espèces' },
  { id: 'banque', label: 'Banque' },
];

export const accountTypes = [
  { id: 'liquide', label: 'Argent liquide', icon: 'wallet', apiType: 'cash' },
  { id: 'bancaire', label: 'Comptes bancaires', icon: 'building', apiType: 'bank' },
  { id: 'carte', label: 'Cartes de crédit', icon: 'credit-card', apiType: 'credit_card' },
  { id: 'epargne', label: 'Épargne', icon: 'piggy-bank', apiType: 'savings' },
  { id: 'autre', label: 'Autre', icon: 'folder', apiType: 'other' },
];

export const accounts = [
  { id: 'especes', name: 'Espèces', type: 'liquide', balance: 500 },
  { id: 'banque', name: 'Banque', type: 'bancaire', balance: 2500 },
  { id: 'carte', name: 'Carte Visa', type: 'carte', balance: -150 },
];

export const monthlyBudget = 2000;

export const transactions = [
  // Mars 2026
  { id: 1, type: 'expense', category: 'cadeaux', method: 'especes', amount: -500, date: '2026-03-13' },
  { id: 2, type: 'expense', category: 'alimentation', method: 'banque', amount: -85.50, date: '2026-03-12' },
  { id: 3, type: 'income', category: 'salaire', method: 'banque', amount: 3500, date: '2026-03-10' },
  { id: 4, type: 'expense', category: 'transport', method: 'banque', amount: -45, date: '2026-03-09' },
  { id: 5, type: 'expense', category: 'alimentation', method: 'especes', amount: -32, date: '2026-03-08' },
  { id: 6, type: 'expense', category: 'loisirs', method: 'banque', amount: -19.90, date: '2026-03-06' },
  { id: 7, type: 'expense', category: 'sante', method: 'banque', amount: -65, date: '2026-03-05' },
  { id: 8, type: 'expense', category: 'logement', method: 'banque', amount: -1200, date: '2026-03-01' },
  { id: 9, type: 'transfer', fromMethod: 'banque', toMethod: 'especes', amount: 200, date: '2026-03-03' },
  
  // Fevrier 2026
  { id: 10, type: 'expense', category: 'alimentation', method: 'banque', amount: -156.80, date: '2026-02-28' },
  { id: 11, type: 'expense', category: 'transport', method: 'banque', amount: -89, date: '2026-02-25' },
  { id: 12, type: 'expense', category: 'loisirs', method: 'banque', amount: -35, date: '2026-02-22' },
  { id: 13, type: 'income', category: 'salaire', method: 'banque', amount: 3500, date: '2026-02-20' },
  { id: 14, type: 'expense', category: 'alimentation', method: 'especes', amount: -45, date: '2026-02-18' },
  { id: 15, type: 'expense', category: 'sante', method: 'banque', amount: -28, date: '2026-02-15' },
  { id: 16, type: 'expense', category: 'logement', method: 'banque', amount: -1200, date: '2026-02-01' },
  { id: 17, type: 'transfer', fromMethod: 'banque', toMethod: 'especes', amount: 150, date: '2026-02-10' },
  
  // Janvier 2026
  { id: 18, type: 'expense', category: 'alimentation', method: 'banque', amount: -178.90, date: '2026-01-31' },
  { id: 19, type: 'expense', category: 'cadeaux', method: 'banque', amount: -150, date: '2026-01-28' },
  { id: 20, type: 'expense', category: 'transport', method: 'banque', amount: -75, date: '2026-01-25' },
  { id: 21, type: 'expense', category: 'loisirs', method: 'banque', amount: -55, date: '2026-01-20' },
  { id: 22, type: 'income', category: 'salaire', method: 'banque', amount: 3500, date: '2026-01-15' },
  { id: 23, type: 'expense', category: 'alimentation', method: 'especes', amount: -52, date: '2026-01-12' },
  { id: 24, type: 'expense', category: 'sante', method: 'banque', amount: -85, date: '2026-01-08' },
  { id: 25, type: 'expense', category: 'logement', method: 'banque', amount: -1200, date: '2026-01-02' },
  { id: 26, type: 'transfer', fromMethod: 'especes', toMethod: 'banque', amount: 100, date: '2026-01-05' },
];

export const getCategoryById = (id) => categories.find(c => c.id === id);
export const getMethodById = (id) => paymentMethods.find(m => m.id === id);
export const getAccountById = (id) => accounts.find(a => a.id === id);
export const getAccountTypeById = (id) => accountTypes.find(t => t.id === id);
