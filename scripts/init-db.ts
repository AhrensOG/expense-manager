import 'dotenv/config';
import { sequelize, Currency, Category } from '../src/db';

const currencies = [
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

const expenseCategories = [
  { name: 'Food & Dining', type: 'expense', icon: 'utensils', color: '#FF6B6B' },
  { name: 'Transportation', type: 'expense', icon: 'car', color: '#4ECDC4' },
  { name: 'Accommodation', type: 'expense', icon: 'bed', color: '#45B7D1' },
  { name: 'Entertainment', type: 'expense', icon: 'film', color: '#96CEB4' },
  { name: 'Shopping', type: 'expense', icon: 'shoppingBag', color: '#FFEAA7' },
  { name: 'Health', type: 'expense', icon: 'heart', color: '#DDA0DD' },
  { name: 'Other', type: 'expense', icon: 'ellipsisHorizontal', color: '#95A5A6' },
];

const incomeCategories = [
  { name: 'Salary', type: 'income', icon: 'briefcase', color: '#2ECC71' },
  { name: 'Freelance', type: 'income', icon: 'laptop', color: '#27AE60' },
  { name: 'Investment', type: 'income', icon: 'trendingUp', color: '#16A085' },
  { name: 'Gift', type: 'income', icon: 'gift', color: '#E74C3C' },
  { name: 'Refund', type: 'income', icon: 'rotateLeft', color: '#3498DB' },
  { name: 'Other Income', type: 'income', icon: 'plus', color: '#9B59B6' },
];

async function initDb() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced');

    await Currency.bulkCreate(currencies);
    console.log('Currencies created');

    await Category.bulkCreate(expenseCategories);
    console.log('Expense categories created');

    await Category.bulkCreate(incomeCategories);
    console.log('Income categories created');

    console.log('Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDb();
