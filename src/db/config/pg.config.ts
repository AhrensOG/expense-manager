import type { Options } from 'sequelize';
import pg from 'pg';

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

export const pgConfig: Options = {
  dialect: 'postgres',
  dialectModule: pg,
  host: DB_HOST,
  port: Number(DB_PORT),
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASSWORD,
};
