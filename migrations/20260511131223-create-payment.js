'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      order_header_id: {
        type: Sequelize.INTEGER,
        references: { model: 'OrderHeaders', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      provider: {
        type: Sequelize.STRING
      },
      transaction_id: {
        type: Sequelize.STRING,
        unique: true
      },
      gross_amount: {
        type: Sequelize.DECIMAL
      },
      payment_status: {
        type: Sequelize.STRING
      },
      payment_type: {
        type: Sequelize.STRING
      },
      paid_at: {
        type: Sequelize.DATE
      },
      raw_response: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('Payments');
  }
};