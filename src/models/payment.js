'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Payment.init({
    order_header_id: DataTypes.INTEGER,
    provider: DataTypes.STRING,
    transaction_id: DataTypes.STRING,
    gross_amount: DataTypes.DECIMAL,
    payment_status: DataTypes.STRING,
    payment_type: DataTypes.STRING,
    paid_at: DataTypes.DATE,
    raw_response: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Payment',
  });
  return Payment;
};