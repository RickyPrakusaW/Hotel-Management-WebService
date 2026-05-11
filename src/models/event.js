'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Event.init({
    organizer_id: DataTypes.INTEGER,
    category_id: DataTypes.INTEGER,
    venue_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    event_date: DataTypes.DATE,
    event_end_date: DataTypes.DATE,
    poster_image: DataTypes.STRING,
    status: DataTypes.STRING,
    is_free: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};