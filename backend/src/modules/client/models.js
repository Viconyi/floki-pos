const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  yob: { type: Number, required: true },
  sex: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  pinHash: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

const PendingUserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  yob: { type: Number, required: true },
  sex: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  pinHash: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

const PendingUser = mongoose.model('PendingUser', PendingUserSchema);

module.exports = { User, PendingUser };