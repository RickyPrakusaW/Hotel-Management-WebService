'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderHeader extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  OrderHeader.init({
    user_id: DataTypes.INTEGER,
    order_code: DataTypes.STRING,
    event_id: DataTypes.INTEGER,
    total_amount: DataTypes.DECIMAL,
    payment_status: DataTypes.STRING,
    payment_method: DataTypes.STRING,
    notes: DataTypes.TEXT,
    expired_at: DataTypes.DATE,
    paid_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'OrderHeader',
  });
  return OrderHeader;
};