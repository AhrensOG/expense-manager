import { Migration } from './types';
import { QueryInterface } from 'sequelize';

export const info = {
  id: '002',
  name: 'Add account names to transfers',
  description: 'Adds from_account_name and to_account_name columns to transfers table for preserving transfer history when accounts are deleted',
};

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(`
    ALTER TABLE "transfers" 
    ADD COLUMN IF NOT EXISTS "fromAccountName" VARCHAR(100)
  `);
  
  await queryInterface.sequelize.query(`
    ALTER TABLE "transfers" 
    ADD COLUMN IF NOT EXISTS "toAccountName" VARCHAR(100)
  `);
  
  await queryInterface.sequelize.query(`
    UPDATE "transfers" t 
    SET "fromAccountName" = a.name
    FROM "accounts" a 
    WHERE t."fromAccountId" = a.id AND t."fromAccountName" IS NULL
  `);
  
  await queryInterface.sequelize.query(`
    UPDATE "transfers" t 
    SET "toAccountName" = a.name
    FROM "accounts" a 
    WHERE t."toAccountId" = a.id AND t."toAccountName" IS NULL
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(`
    ALTER TABLE "transfers" DROP COLUMN IF EXISTS "fromAccountName"
  `);
  
  await queryInterface.sequelize.query(`
    ALTER TABLE "transfers" DROP COLUMN IF EXISTS "toAccountName"
  `);
}
