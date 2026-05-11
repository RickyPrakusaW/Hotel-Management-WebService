const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, 'migrations');
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.js'));

const replacements = [
  // User
  {
    fileMatch: /create-user\.js$/,
    search: "role_id: {\n        type: Sequelize.INTEGER\n      }",
    replace: "role_id: {\n        type: Sequelize.INTEGER,\n        references: { model: 'Roles', key: 'id' },\n        onUpdate: 'CASCADE',\n        onDelete: 'CASCADE'\n      }"
  },
  {
    fileMatch: /create-user\.js$/,
    search: "email: {\n        type: Sequelize.STRING\n      }",
    replace: "email: {\n        type: Sequelize.STRING,\n        unique: true\n      }"
  },
  // Category
  {
    fileMatch: /create-category\.js$/,
    search: "name: {\n        type: Sequelize.STRING\n      }",
    replace: "name: {\n        type: Sequelize.STRING,\n        unique: true\n      }"
  },
  // Event
  {
    fileMatch: /create-event\.js$/,
    search: "organizer_id: {\n        type: Sequelize.INTEGER\n      }",
    replace: "organizer_id: {\n        type: Sequelize.INTEGER,\n        references: { model: 'Users', key: 'id' },\n        onUpdate: 'CASCADE',\n        onDelete: 'CASCADE'\n      }"
  },
  {
    fileMatch: /create-event\.js$/,
    search: "category_id: {\n        type: Sequelize.INTEGER\n      }",
    replace: "category_id: {\n        type: Sequelize.INTEGER,\n        references: { model: 'Categories', key: 'id' },\n        onUpdate: 'CASCADE',\n        onDelete: 'CASCADE'\n      }"
  },
  {
    fileMatch: /create-event\.js$/,
    search: "venue_id: {\n        type: Sequelize.INTEGER\n      }",
    replace: "venue_id: {\n        type: Sequelize.INTEGER,\n        references: { model: 'Venues', key: 'id' },\n        onUpdate: 'CASCADE',\n        onDelete: 'CASCADE'\n      }"
  },
  // OrganizerSubscription
  {
    fileMatch: /create-organizer-subscription\.js$/,
    search: "organizer_id: {\n        type: Sequelize.INTEGER\n      }",
    replace: "organizer_id: {\n        type: Sequelize.INTEGER,\n        references: { model: 'Users', key: 'id' },\n        onUpdate: 'CASCADE',\n        onDelete: 'CASCADE'\n      }"
  },
  {
    fileMatch: /create-organizer-subscription\.js$/,
    search: "subscription_plan_id: {\n        type: Sequelize.INTEGER\n      }",
    replace: "subscription_plan_id: {\n        type: Sequelize.INTEGER,\n        references: { model: 'SubscriptionPlans', key: 'id' },\n        onUpdate: 'CASCADE',\n        onDelete: 'CASCADE'\n      }"
  },
  // TicketType
  {
    fileMatch: /create-ticket-type\.js$/,
    search: "event_id: {\n        type: Sequelize.INTEGER\n      }",
    replace: "event_id: {\n        type: Sequelize.INTEGER,\n        references: { model: 'Events', key: 'id' },\n        onUpdate: 'CASCADE',\n        onDelete: 'CASCADE'\n      }"
  },
  // OrderHeader
  {
    fileMatch: /create-order-header\.js$/,
    search: "user_id: {\n        type: Sequelize.INTEGER\n      }",
    replace: "user_id: {\n        type: Sequelize.INTEGER,\n        references: { model: 'Users', key: 'id' },\n        onUpdate: 'CASCADE',\n        onDelete: 'CASCADE'\n      }"
  },
  {
    fileMatch: /create-order-header\.js$/,
    search: "event_id: {\n        type: Sequelize.INTEGER\n      }",
    replace: "event_id: {\n        type: Sequelize.INTEGER,\n        references: { model: 'Events', key: 'id' },\n        onUpdate: 'CASCADE',\n        onDelete: 'CASCADE'\n      }"
  },
  {
    fileMatch: /create-order-header\.js$/,
    search: "order_code: {\n        type: Sequelize.STRING\n      }",
    replace: "order_code: {\n        type: Sequelize.STRING,\n        unique: true\n      }"
  },
  // OrderDetail
  {
    fileMatch: /create-order-detail\.js$/,
    search: "order_header_id: {\n        type: Sequelize.INTEGER\n      }",
    replace: "order_header_id: {\n        type: Sequelize.INTEGER,\n        references: { model: 'OrderHeaders', key: 'id' },\n        onUpdate: 'CASCADE',\n        onDelete: 'CASCADE'\n      }"
  },
  {
    fileMatch: /create-order-detail\.js$/,
    search: "ticket_type_id: {\n        type: Sequelize.INTEGER\n      }",
    replace: "ticket_type_id: {\n        type: Sequelize.INTEGER,\n        references: { model: 'TicketTypes', key: 'id' },\n        onUpdate: 'CASCADE',\n        onDelete: 'CASCADE'\n      }"
  },
  {
    fileMatch: /create-order-detail\.js$/,
    search: "ticket_code: {\n        type: Sequelize.STRING\n      }",
    replace: "ticket_code: {\n        type: Sequelize.STRING,\n        unique: true\n      }"
  },
  // Payment
  {
    fileMatch: /create-payment\.js$/,
    search: "order_header_id: {\n        type: Sequelize.INTEGER\n      }",
    replace: "order_header_id: {\n        type: Sequelize.INTEGER,\n        references: { model: 'OrderHeaders', key: 'id' },\n        onUpdate: 'CASCADE',\n        onDelete: 'CASCADE'\n      }"
  },
  {
    fileMatch: /create-payment\.js$/,
    search: "transaction_id: {\n        type: Sequelize.STRING\n      }",
    replace: "transaction_id: {\n        type: Sequelize.STRING,\n        unique: true\n      }"
  },
  // UploadedFile
  {
    fileMatch: /create-uploaded-file\.js$/,
    search: "user_id: {\n        type: Sequelize.INTEGER\n      }",
    replace: "user_id: {\n        type: Sequelize.INTEGER,\n        references: { model: 'Users', key: 'id' },\n        onUpdate: 'CASCADE',\n        onDelete: 'CASCADE'\n      }"
  },
  {
    fileMatch: /create-uploaded-file\.js$/,
    search: "event_id: {\n        type: Sequelize.INTEGER\n      }",
    replace: "event_id: {\n        type: Sequelize.INTEGER,\n        references: { model: 'Events', key: 'id' },\n        onUpdate: 'CASCADE',\n        onDelete: 'CASCADE'\n      }"
  }
];

files.forEach(file => {
  const filePath = path.join(migrationsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  replacements.forEach(r => {
    if (r.fileMatch.test(file)) {
      if (content.includes(r.search)) {
        content = content.replace(r.search, r.replace);
        changed = true;
      }
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Patched ${file}`);
  }
});
