import { Sequelize } from 'sequelize';
import { pgConfig } from './pg.config';

export const sequelize = new Sequelize({
  ...pgConfig,
  logging: false,
});
