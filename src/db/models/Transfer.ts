import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';
import { Currency } from './Currency';
import { Account } from './Account';

export class Transfer extends Model {
  declare id: number;
  declare amount: number;
  declare description: string | null;
  declare date: Date;
  declare userId: number;
  declare currencyId: number;
  declare fromAccountId: number;
  declare toAccountId: number;
}

Transfer.init(
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
    fromAccountId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'accounts',
        key: 'id',
      },
    },
    toAccountId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'accounts',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'transfers',
  }
);

Transfer.belongsTo(User, { foreignKey: 'userId' });
Transfer.belongsTo(Currency, { foreignKey: 'currencyId', as: 'Currency' });
Transfer.belongsTo(Account, { as: 'fromAccount', foreignKey: 'fromAccountId' });
Transfer.belongsTo(Account, { as: 'toAccount', foreignKey: 'toAccountId' });

User.hasMany(Transfer, { foreignKey: 'userId' });
