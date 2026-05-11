'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OrderHeaders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      order_code: {
        type: Sequelize.STRING,
        unique: true
      },
      event_id: {
        type: Sequelize.INTEGER,
        references: { model: 'Events', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      total_amount: {
        type: Sequelize.DECIMAL
      },
      payment_status: {
        type: Sequelize.STRING
      },
      payment_method: {
        type: Sequelize.STRING
      },
      notes: {
        type: Sequelize.TEXT
      },
      expired_at: {
        type: Sequelize.DATE
      },
      paid_at: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('OrderHeaders');
  }
};