import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';
import { Currency } from './Currency';
import { Category } from './Category';

export class Recurring extends Model {
  declare id: number;
  declare name: string;
  declare amount: number;
  declare type: 'expense' | 'income';
  declare frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  declare startDate: Date;
  declare endDate: Date | null;
  declare currencyId: number;
  declare categoryId: number | null;
  declare userId: number;
  declare isActive: boolean;
}

Recurring.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('expense', 'income'),
      allowNull: false,
    },
    frequency: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
      allowNull: false,
      defaultValue: 'monthly',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'recurring',
  }
);

Recurring.belongsTo(User, { foreignKey: 'userId' });
Recurring.belongsTo(Currency, { foreignKey: 'currencyId', as: 'Currency' });
Recurring.belongsTo(Category, { foreignKey: 'categoryId', as: 'Category' });
User.hasMany(Recurring, { foreignKey: 'userId' });
