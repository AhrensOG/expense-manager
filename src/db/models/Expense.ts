import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';
import { Currency } from './Currency';
import { Category } from './Category';
import { Account } from './Account';
import { Trip } from './Trip';

export class Expense extends Model {
  declare id: number;
  declare amount: number;
  declare description: string | null;
  declare date: Date;
  declare userId: number;
  declare currencyId: number;
  declare categoryId: number | null;
  declare accountId: number | null;
  declare tripId: number | null;
}

Expense.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    currencyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'currencies',
        key: 'id',
      },
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    accountId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'accounts',
        key: 'id',
      },
    },
    tripId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'trips',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'expenses',
  }
);

Expense.belongsTo(User, { foreignKey: 'userId' });
Expense.belongsTo(Currency, { foreignKey: 'currencyId', as: 'Currency' });
Expense.belongsTo(Category, { foreignKey: 'categoryId', as: 'Category' });
Expense.belongsTo(Account, { foreignKey: 'accountId', as: 'Account' });
Expense.belongsTo(Trip, { foreignKey: 'tripId', as: 'Trip' });

User.hasMany(Expense, { foreignKey: 'userId' });
