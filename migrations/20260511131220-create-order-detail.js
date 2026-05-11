'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('OrderDetails', {
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
      ticket_type_id: {
        type: Sequelize.INTEGER,
        references: { model: 'TicketTypes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      ticket_code: {
        type: Sequelize.STRING,
        unique: true
      },
      qty: {
        type: Sequelize.INTEGER
      },
      price: {
        type: Sequelize.DECIMAL
      },
      subtotal: {
        type: Sequelize.DECIMAL
      },
      status: {
        type: Sequelize.STRING
      },
      qr_code: {
        type: Sequelize.TEXT
      },
      checked_in_at: {
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
    await queryInterface.dropTable('OrderDetails');
  }
};