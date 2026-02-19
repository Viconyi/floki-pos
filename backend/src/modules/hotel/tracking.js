// Live tracking utility for backend
// Placeholder: Use Socket.io for real-time delivery location updates
const setupTracking = (io) => {
  io.on('connection', (socket) => {
    socket.on('updateLocation', (data) => {
      // Broadcast updated location to relevant clients
      io.emit('locationUpdate', data);
    });
    socket.on('updateOrderStatus', (data) => {
      // Broadcast order status changes with ETA and driver info
      // data: { orderId, status, etaMinutes, driver: { name, phone } }
      io.emit('orderStatusUpdate', data);
    });
  });
};

module.exports = { setupTracking };
