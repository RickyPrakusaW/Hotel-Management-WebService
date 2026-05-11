'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    
    // 1. Roles
    await queryInterface.bulkInsert('Roles', [
      { id: 1, name: 'Admin', description: 'Kelola sistem', createdAt: now, updatedAt: now },
      { id: 2, name: 'Organizer', description: 'Buat event', createdAt: now, updatedAt: now },
      { id: 3, name: 'Customer', description: 'Beli tiket', createdAt: now, updatedAt: now }
    ], {});

    // 2. Users
    await queryInterface.bulkInsert('Users', [
      { id: 1, role_id: 1, full_name: 'Super Admin', email: 'admin@event.com', password: 'hashed_pass_1', phone: '081122334455', is_active: true, createdAt: now, updatedAt: now },
      { id: 2, role_id: 2, full_name: 'Java Jazz Group', email: 'info@javajazz.com', password: 'hashed_pass_2', phone: '08123456789', is_active: true, createdAt: now, updatedAt: now },
      { id: 3, role_id: 2, full_name: 'Tech Conference Organizer', email: 'contact@techconf.id', password: 'hashed_pass_3', phone: '08129876543', is_active: true, createdAt: now, updatedAt: now },
      { id: 4, role_id: 3, full_name: 'Budi Santoso', email: 'budi@gmail.com', password: 'hashed_pass_4', phone: '085511223344', is_active: true, createdAt: now, updatedAt: now },
      { id: 5, role_id: 3, full_name: 'Siti Aminah', email: 'siti@gmail.com', password: 'hashed_pass_5', phone: '085544332211', is_active: true, createdAt: now, updatedAt: now },
      { id: 6, role_id: 3, full_name: 'Rendi Wijaya', email: 'rendi@gmail.com', password: 'hashed_pass_6', phone: '085599887766', is_active: true, createdAt: now, updatedAt: now }
    ], {});

    // 3. Categories
    await queryInterface.bulkInsert('Categories', [
      { id: 1, name: 'Musik & Konser', createdAt: now, updatedAt: now },
      { id: 2, name: 'Seminar & Workshop', createdAt: now, updatedAt: now },
      { id: 3, name: 'Olahraga', createdAt: now, updatedAt: now },
      { id: 4, name: 'Seni & Budaya', createdAt: now, updatedAt: now },
      { id: 5, name: 'Teknologi & IT', createdAt: now, updatedAt: now }
    ], {});

    // 4. Venues
    await queryInterface.bulkInsert('Venues', [
      { id: 1, name: 'JIExpo Kemayoran', city: 'Jakarta', address: 'Jl. Benyamin Suaeb', capacity: 5000, createdAt: now, updatedAt: now },
      { id: 2, name: 'ICE BSD', city: 'Tangerang', address: 'BSD City', capacity: 10000, createdAt: now, updatedAt: now },
      { id: 3, name: 'Stadion Utama GBK', city: 'Jakarta', address: 'Senayan', capacity: 75000, createdAt: now, updatedAt: now },
      { id: 4, name: 'Balai Kartini', city: 'Jakarta', address: 'Jl. Gatot Subroto', capacity: 3500, createdAt: now, updatedAt: now },
      { id: 5, name: 'Jatim Expo', city: 'Surabaya', address: 'Jl. Ahmad Yani', capacity: 5000, createdAt: now, updatedAt: now }
    ], {});

    // 5. Events
    await queryInterface.bulkInsert('Events', [
      { id: 1, organizer_id: 2, category_id: 1, venue_id: 1, title: 'Jakarta Jazz Night 2024', status: 'published', event_date: '2024-08-15 19:00:00', createdAt: now, updatedAt: now },
      { id: 2, organizer_id: 3, category_id: 5, venue_id: 2, title: 'AI Future Summit', status: 'published', event_date: '2024-09-10 09:00:00', createdAt: now, updatedAt: now },
      { id: 3, organizer_id: 2, category_id: 4, venue_id: 4, title: 'Wayang Heritage Show', status: 'published', event_date: '2024-08-20 20:00:00', createdAt: now, updatedAt: now },
      { id: 4, organizer_id: 3, category_id: 2, venue_id: 5, title: 'Digital Marketing 101', status: 'published', event_date: '2024-10-05 10:00:00', createdAt: now, updatedAt: now },
      { id: 5, organizer_id: 2, category_id: 3, venue_id: 3, title: 'Indonesia Marathon 2024', status: 'draft', event_date: '2024-11-12 05:00:00', createdAt: now, updatedAt: now }
    ], {});

    // 6. Subscription Plans
    await queryInterface.bulkInsert('SubscriptionPlans', [
      { id: 1, name: 'Free', price: 0, event_limit: 1, createdAt: now, updatedAt: now },
      { id: 2, name: 'Pro', price: 99000, event_limit: 10, createdAt: now, updatedAt: now },
      { id: 3, name: 'Enterprise', price: 299000, event_limit: 999, createdAt: now, updatedAt: now },
      { id: 4, name: 'Starter', price: 49000, event_limit: 3, createdAt: now, updatedAt: now },
      { id: 5, name: 'Annual VIP', price: 2500000, event_limit: 9999, createdAt: now, updatedAt: now }
    ], {});

    // 7. Ticket Types
    await queryInterface.bulkInsert('TicketTypes', [
      { id: 1, event_id: 1, name: 'Festival A', price: 250000.00, quota: 500, createdAt: now, updatedAt: now },
      { id: 2, event_id: 1, name: 'VIP', price: 750000.00, quota: 50, createdAt: now, updatedAt: now },
      { id: 3, event_id: 2, name: 'Early Bird', price: 150000.00, quota: 100, createdAt: now, updatedAt: now },
      { id: 4, event_id: 3, name: 'Reguler', price: 100000.00, quota: 300, createdAt: now, updatedAt: now },
      { id: 5, event_id: 4, name: 'Online Access', price: 50000.00, quota: 1000, createdAt: now, updatedAt: now }
    ], {});

    // 8. Order Headers
    await queryInterface.bulkInsert('OrderHeaders', [
      { id: 1, user_id: 4, order_code: 'ORD-001', event_id: 1, total_amount: 250000.00, payment_status: 'paid', payment_method: 'Transfer BCA', createdAt: now, updatedAt: now },
      { id: 2, user_id: 5, order_code: 'ORD-002', event_id: 1, total_amount: 500000.00, payment_status: 'pending', payment_method: 'GoPay', createdAt: now, updatedAt: now },
      { id: 3, user_id: 6, order_code: 'ORD-003', event_id: 2, total_amount: 150000.00, payment_status: 'paid', payment_method: 'Virtual Account', createdAt: now, updatedAt: now },
      { id: 4, user_id: 4, order_code: 'ORD-004', event_id: 3, total_amount: 100000.00, payment_status: 'cancelled', payment_method: 'OVO', createdAt: now, updatedAt: now },
      { id: 5, user_id: 5, order_code: 'ORD-005', event_id: 4, total_amount: 50000.00, payment_status: 'paid', payment_method: 'Kartu Kredit', createdAt: now, updatedAt: now }
    ], {});

    // 9. Order Details
    await queryInterface.bulkInsert('OrderDetails', [
      { id: 1, order_header_id: 1, ticket_type_id: 1, ticket_code: 'TIX-001-AAA', qty: 1, price: 250000.00, subtotal: 250000.00, createdAt: now, updatedAt: now },
      { id: 2, order_header_id: 2, ticket_type_id: 1, ticket_code: 'TIX-002-BBB', qty: 2, price: 250000.00, subtotal: 500000.00, createdAt: now, updatedAt: now },
      { id: 3, order_header_id: 3, ticket_type_id: 3, ticket_code: 'TIX-003-CCC', qty: 1, price: 150000.00, subtotal: 150000.00, createdAt: now, updatedAt: now },
      { id: 4, order_header_id: 4, ticket_type_id: 4, ticket_code: 'TIX-004-DDD', qty: 1, price: 100000.00, subtotal: 100000.00, createdAt: now, updatedAt: now },
      { id: 5, order_header_id: 5, ticket_type_id: 5, ticket_code: 'TIX-005-EEE', qty: 1, price: 50000.00, subtotal: 50000.00, createdAt: now, updatedAt: now }
    ], {});

    // 10. Payment Methods
    await queryInterface.bulkInsert('PaymentMethods', [
      { id: 1, name: 'Transfer Bank', provider: 'BCA', createdAt: now, updatedAt: now },
      { id: 2, name: 'E-Wallet', provider: 'GoPay', createdAt: now, updatedAt: now },
      { id: 3, name: 'Virtual Account', provider: 'BNI', createdAt: now, updatedAt: now },
      { id: 4, name: 'Credit Card', provider: 'Midtrans', createdAt: now, updatedAt: now },
      { id: 5, name: 'Retail', provider: 'Alfamart', createdAt: now, updatedAt: now }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('PaymentMethods', null, {});
    await queryInterface.bulkDelete('OrderDetails', null, {});
    await queryInterface.bulkDelete('OrderHeaders', null, {});
    await queryInterface.bulkDelete('TicketTypes', null, {});
    await queryInterface.bulkDelete('SubscriptionPlans', null, {});
    await queryInterface.bulkDelete('Events', null, {});
    await queryInterface.bulkDelete('Venues', null, {});
    await queryInterface.bulkDelete('Categories', null, {});
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Roles', null, {});
  }
};
