import 'dotenv/config';
import { sequelize } from '../src/db';

async function migrate() {
  try {
    // Add accountId column to expenses table
    await sequelize.query(`
      ALTER TABLE expenses 
      ADD COLUMN IF NOT EXISTS accountId INTEGER REFERENCES accounts(id);
    `);
    console.log('Added accountId to expenses table');

    // Add accountId column to incomes table
    await sequelize.query(`
      ALTER TABLE incomes 
      ADD COLUMN IF NOT EXISTS accountId INTEGER REFERENCES accounts(id);
    `);
    console.log('Added accountId to incomes table');

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrate();
