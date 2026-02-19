// Mongoose models for menu and till
const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  available: Boolean,
  image: String,
  category: {
    type: String,
    enum: ['Foods', 'Utilities', 'Condiments', 'Packaging'],
    default: 'Foods'
  },
  type: {
    type: String,
    enum: ['Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Supper', 'Specials', 'Vegan', 'Vegetarian'],
    default: 'Breakfast'
  },
  ingredients: [String],
  // Offer configuration
  offerPercent: { type: Number, default: 0 },
  offerActive: { type: Boolean, default: false },
});

const TillSchema = new mongoose.Schema({
  tillNumber: String,
  businessName: String,
  active: Boolean,
});

// Staff user accounts (admin-managed)
const StaffUserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, index: true },
  // Split name into first and last for clarity
  firstName: { type: String },
  lastName: { type: String },
  // Keep composite name for backward compatibility/display if needed
  name: { type: String },
  role: { type: String, enum: ['staff','manager','admin'], default: 'staff' },
  pinHash: { type: String, required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

const MenuItem = mongoose.model('MenuItem', MenuItemSchema);
const Till = mongoose.model('Till', TillSchema);
const StaffUser = mongoose.model('StaffUser', StaffUserSchema);

module.exports = { MenuItem, Till, StaffUser };
