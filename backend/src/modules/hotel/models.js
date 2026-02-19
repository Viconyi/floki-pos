// Mongoose models for orders and offers
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  items: [{
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    quantity: Number,
  }],
  clientEmail: String,
  clientName: String,
  clientPhone: String,
  deliveryAddress: String,
  deliveryType: { type: String, enum: ['Pickup', 'Delivery'], default: 'Pickup' },
  saleType: { type: String },
  servedByName: String,
  status: { type: String, enum: ['pending', 'preparing', 'ready', 'on the way', 'arrived', 'delivered', 'completed', 'cancelled'], default: 'pending' },
  total: Number,
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  deliveryLocation: {
    lat: Number,
    lng: Number,
  },
  createdAt: { type: Date, default: Date.now },
  receiptSent: { type: Boolean, default: false },
});

const OfferSchema = new mongoose.Schema({
  title: String,
  description: String,
  discount: Number,
  validFrom: Date,
  validTo: Date,
  active: Boolean,
});

const HotelConfigSchema = new mongoose.Schema({
  utensils: [String],
  condiments: [String],
});

const ReviewSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  type: { type: String, enum: ['item','delivery'], default: 'item' },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  userEmail: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', OrderSchema);
const Offer = mongoose.model('Offer', OfferSchema);
const HotelConfig = mongoose.model('HotelConfig', HotelConfigSchema);
const Review = mongoose.model('Review', ReviewSchema);

module.exports = { Order, Offer, HotelConfig, Review };
