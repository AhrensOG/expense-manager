import { QueryInterface } from 'sequelize';

export interface Migration {
  id: string;
  name: string;
  description: string;
  up: (queryInterface: QueryInterface) => Promise<void>;
  down: (queryInterface: QueryInterface) => Promise<void>;
}
