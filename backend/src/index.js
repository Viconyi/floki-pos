require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
// Increase body size limits to support base64 images and larger payloads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// expose io to routes
app.set('io', io);

// MPESA integration (resilient placeholder)
let mpesaClient = null;
try {
  mpesaClient = require('./modules/admin/mpesa');
} catch (e) {
  console.warn('MPESA client not available, continuing without it');
}
// Notification integration (placeholder)
const { sendNotification } = require('./modules/admin/notification');
// Live tracking integration
const { setupTracking } = require('./modules/hotel/tracking');

// Admin routes for menu and till
const adminRoutes = require('./modules/admin/routes');
// Hotel routes for orders and offers
const hotelRoutes = require('./modules/hotel/routes');
const { router: staffAuthRoutes } = require('./modules/hotel/staffAuth');

app.use('/api/admin', adminRoutes);
app.use('/api/hotel', hotelRoutes);
app.use('/api/hotel/auth', staffAuthRoutes);
// MPESA routes (STK push/callback)
try {
  app.use('/api/mpesa', require('./mpesa'));
} catch (e) {
  console.warn('MPESA routes not loaded:', e && e.message ? e.message : e);
}
// Auth routes (signup, reset PIN)
app.use('/api/auth', require('./modules/client/auth'));

// Setup live tracking with socket.io
setupTracking(io);

// Use environment variable PORT as required by cPanel/Node.js hosting
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const DB_DRIVER = (process.env.DB_DRIVER || '').toLowerCase();

// Start HTTP server first to avoid ECONNREFUSED from frontend proxy
server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

// Initialize database depending on driver
if (DB_DRIVER === 'mysql') {
  // Initialize MySQL schema
  const { ensureSchema } = require('./db/sql');
  ensureSchema()
    .then(() => console.log('MySQL schema ready'))
    .catch((err) => console.error('MySQL init error:', err && err.message ? err.message : err));
} else {
  // Connect to MongoDB in the background and log status
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('MongoDB connected');
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err && err.message ? err.message : err);
    });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB runtime error:', err && err.message ? err.message : err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });
}

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  // TODO: Handle live delivery tracking events
});
