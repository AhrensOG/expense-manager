import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Currency extends Model {
  declare id: number;
  declare code: string;
  declare symbol: string;
  declare name: string;
}

Currency.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(3),
      allowNull: false,
      unique: true,
    },
    symbol: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'currencies',
  }
);
