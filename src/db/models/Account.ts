import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';
import { Currency } from './Currency';

export class Account extends Model {
  declare id: number;
  declare name: string;
  declare type: 'cash' | 'bank' | 'credit_card' | 'savings' | 'other';
  declare balance: number;
  declare currencyId: number;
  declare userId: number;
}

Account.init(
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
    type: {
      type: DataTypes.ENUM('cash', 'bank', 'credit_card', 'savings', 'other'),
      allowNull: false,
      defaultValue: 'cash',
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    currencyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'currencies',
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
  },
  {
    sequelize,
    tableName: 'accounts',
  }
);

Account.belongsTo(User, { foreignKey: 'userId' });
Account.belongsTo(Currency, { foreignKey: 'currencyId', as: 'Currency' });
User.hasMany(Account, { foreignKey: 'userId' });
