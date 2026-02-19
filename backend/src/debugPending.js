require('dotenv').config();
const mongoose = require('mongoose');
const { PendingUser } = require('./modules/client/models');

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node src/debugPending.js <email>');
    process.exit(1);
  }
  const uri = process.env.MONGO_URI;
  await mongoose.connect(uri);
  const pu = await PendingUser.findOne({ email: String(email).trim().toLowerCase() });
  if (!pu) {
    console.log('No pending user for', email);
  } else {
    console.log({ email: pu.email, code: pu.code, expiresAt: pu.expiresAt });
  }
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });