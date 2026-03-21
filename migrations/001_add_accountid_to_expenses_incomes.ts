import { Migration } from './types';
import { QueryInterface } from 'sequelize';

export const info = {
  id: '001',
  name: 'Add accountId to expenses and incomes',
  description: 'Adds accountId foreign key column to expenses and incomes tables',
};

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(`
    ALTER TABLE expenses 
    ADD COLUMN IF NOT EXISTS "accountId" INTEGER REFERENCES accounts(id)
  `);
  
  await queryInterface.sequelize.query(`
    ALTER TABLE incomes 
    ADD COLUMN IF NOT EXISTS "accountId" INTEGER REFERENCES accounts(id)
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(`
    ALTER TABLE expenses DROP COLUMN IF EXISTS "accountId"
  `);
  
  await queryInterface.sequelize.query(`
    ALTER TABLE incomes DROP COLUMN IF EXISTS "accountId"
  `);
}
