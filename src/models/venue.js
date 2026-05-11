'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Venue extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Venue.init({
    name: DataTypes.STRING,
    address: DataTypes.TEXT,
    city: DataTypes.STRING,
    latitude: DataTypes.DECIMAL,
    longitude: DataTypes.DECIMAL,
    capacity: DataTypes.INTEGER,
    contact_person: DataTypes.STRING,
    contact_phone: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Venue',
  });
  return Venue;
};