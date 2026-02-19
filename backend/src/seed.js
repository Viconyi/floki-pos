require('dotenv').config();
const mongoose = require('mongoose');
const { MenuItem } = require('./modules/admin/models');
const { Order } = require('./modules/hotel/models');

const MONGO_URI = process.env.MONGO_URI;
const DB_DRIVER = (process.env.DB_DRIVER || '').toLowerCase();
let getPool, ensureSchema;
if (DB_DRIVER === 'mysql') {
  ({ getPool, ensureSchema } = require('./db/sql'));
}

async function main() {
  // Common sample data
  const sampleMenu = [
    { name: 'Pancakes', description: 'Fluffy pancakes with syrup', price: 250, available: true, image: '' },
    { name: 'Omelette', description: 'Cheese & veggie omelette', price: 200, available: true, image: '' },
    { name: 'Burger', description: 'Juicy beef burger', price: 350, available: true, image: '' },
    { name: 'Pizza', description: 'Cheese & tomato pizza', price: 600, available: true, image: '' },
  ];
  if (DB_DRIVER === 'mysql') {
    await ensureSchema();
    const p = await getPool();
    // Upsert menu by name
    for (const m of sampleMenu) {
      const [rows] = await p.query('SELECT id FROM menu_items WHERE name=?', [m.name]);
      if (rows.length === 0) {
        await p.query('INSERT INTO menu_items (name, description, price, available, image) VALUES (?,?,?,?,?)', [m.name, m.description, m.price, m.available, m.image || null]);
      }
    }
    const [menu] = await p.query('SELECT * FROM menu_items');
    const pancakes = menu.find(x => x.name === 'Pancakes');
    const burger = menu.find(x => x.name === 'Burger');
    const pizza = menu.find(x => x.name === 'Pizza');
    const [orderCountRows] = await p.query('SELECT COUNT(*) as c FROM orders');
    if ((orderCountRows[0]?.c || 0) === 0) {
      const [o1] = await p.query('INSERT INTO orders (client_name, client_phone, delivery_address, status, total, payment_status) VALUES (?,?,?,?,?,?)', ['John Doe', '+254712345678', 'Kisii University Gate B road', 'preparing', 2*250 + 350, 'paid']);
      await p.query('INSERT INTO order_items (order_id, menu_item_id, quantity) VALUES (?,?,?),(?,?,?)', [o1.insertId, pancakes?.id || null, 2, o1.insertId, burger?.id || null, 1]);
      const [o2] = await p.query('INSERT INTO orders (client_name, client_phone, delivery_address, status, total, payment_status) VALUES (?,?,?,?,?,?)', ['Jane Smith', '+254700000000', 'CBD', 'delivered', 600, 'paid']);
      await p.query('INSERT INTO order_items (order_id, menu_item_id, quantity) VALUES (?,?,?)', [o2.insertId, pizza?.id || null, 1]);
      console.log('Inserted sample orders (MySQL)');
    }
    console.log('Seeding complete (MySQL)');
    return;
  }

  // Mongo path
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB for seeding');
  const upserted = [];
  for (const m of sampleMenu) {
    const doc = await MenuItem.findOneAndUpdate(
      { name: m.name },
      { $setOnInsert: m },
      { upsert: true, new: true }
    );
    upserted.push(doc);
  }
  console.log(`Menu items present: ${upserted.length}`);
  const countOrders = await Order.countDocuments();
  if (countOrders === 0) {
    const pancakes = upserted.find(i => i.name === 'Pancakes');
    const burger = upserted.find(i => i.name === 'Burger');
    const pizza = upserted.find(i => i.name === 'Pizza');
    const seedOrders = [
      { items: [{ menuItem: pancakes?._id, quantity: 2 }, { menuItem: burger?._id, quantity: 1 }], clientName: 'John Doe', clientPhone: '+254712345678', deliveryAddress: 'Kisii University Gate B road', status: 'preparing', total: 2*250 + 350, paymentStatus: 'paid' },
      { items: [{ menuItem: pizza?._id, quantity: 1 }], clientName: 'Jane Smith', clientPhone: '+254700000000', deliveryAddress: 'CBD', status: 'delivered', total: 600, paymentStatus: 'paid' },
    ];
    await Order.insertMany(seedOrders);
    console.log('Inserted sample orders');
  } else {
    console.log(`Orders already present: ${countOrders}`);
  }
  await mongoose.disconnect();
  console.log('Seeding complete (Mongo)');
}

main().catch(err => {
  console.error('Seed error:', err && err.message ? err.message : err);
  process.exitCode = 1;
});
