import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';
import { Currency } from './Currency';

export class Trip extends Model {
  declare id: number;
  declare name: string;
  declare startDate: Date;
  declare endDate: Date | null;
  declare currencyId: number;
  declare userId: number;
}

Trip.init(
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
    tableName: 'trips',
  }
);

Trip.belongsTo(User, { foreignKey: 'userId' });
Trip.belongsTo(Currency, { foreignKey: 'currencyId' });
User.hasMany(Trip, { foreignKey: 'userId' });
