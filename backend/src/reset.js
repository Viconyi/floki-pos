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

async function resetMongo() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
  const resMenu = await MenuItem.deleteMany({});
  const resOrders = await Order.deleteMany({});
  console.log(`Deleted MenuItem docs: ${resMenu.deletedCount}`);
  console.log(`Deleted Order docs: ${resOrders.deletedCount}`);
  await mongoose.disconnect();
  console.log('MongoDB reset complete');
}

async function resetMySQL() {
  await ensureSchema();
  const p = await getPool();
  // Delete child table first
  await p.query('DELETE FROM order_items');
  const [ordersRes] = await p.query('DELETE FROM orders');
  const [menuRes] = await p.query('DELETE FROM menu_items');
  console.log(`Deleted Orders (affected rows): ${ordersRes.affectedRows}`);
  console.log(`Deleted Menu Items (affected rows): ${menuRes.affectedRows}`);
  console.log('MySQL reset complete');
}

async function main() {
  if (DB_DRIVER === 'mysql') {
    await resetMySQL();
  } else {
    await resetMongo();
  }
  console.log('Reset finished. Database is now empty for menu and orders.');
}

main().catch(err => {
  console.error('Reset error:', err && err.message ? err.message : err);
  process.exitCode = 1;
});
