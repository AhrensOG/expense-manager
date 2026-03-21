import { Migration } from './types';
import { QueryInterface } from 'sequelize';

export const info = {
  id: '003',
  name: 'Allow null account IDs in transfers',
  description: 'Changes fromAccountId and toAccountId to nullable for soft-delete support',
};

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(`
    ALTER TABLE "transfers" ALTER COLUMN "fromAccountId" DROP NOT NULL
  `);
  
  await queryInterface.sequelize.query(`
    ALTER TABLE "transfers" ALTER COLUMN "toAccountId" DROP NOT NULL
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.sequelize.query(`
    ALTER TABLE "transfers" ALTER COLUMN "fromAccountId" SET NOT NULL
  `);
  
  await queryInterface.sequelize.query(`
    ALTER TABLE "transfers" ALTER COLUMN "toAccountId" SET NOT NULL
  `);
}
