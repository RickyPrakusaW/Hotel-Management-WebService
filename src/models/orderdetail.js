'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  OrderDetail.init({
    order_header_id: DataTypes.INTEGER,
    ticket_type_id: DataTypes.INTEGER,
    ticket_code: DataTypes.STRING,
    qty: DataTypes.INTEGER,
    price: DataTypes.DECIMAL,
    subtotal: DataTypes.DECIMAL,
    status: DataTypes.STRING,
    qr_code: DataTypes.TEXT,
    checked_in_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'OrderDetail',
  });
  return OrderDetail;
};