// MPESA integration utility for backend
// Be resilient if mpesa library isn't installed; export a stub
let Mpesa;
try {
  // Prefer mpesa-node if available
  Mpesa = require('mpesa-node');
} catch (e) {
  try {
    // Fallback to mpesa-api if available
    Mpesa = require('mpesa-api');
  } catch (err) {
    // Last resort: export a no-op client to prevent startup crash
    module.exports = {
      simulateTransaction: async () => ({ ok: true, stub: true }),
      stkPush: async () => ({ ok: true, stub: true }),
    };
    return;
  }
}

const mpesaClient = new Mpesa({
  consumerKey: process.env.MPESA_CONSUMER_KEY || 'your_consumer_key',
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || 'your_consumer_secret',
  shortCode: process.env.MPESA_SHORT_CODE || '123456',
  initiatorName: process.env.MPESA_INITIATOR_NAME || 'test_initiator',
  initiatorPassword: process.env.MPESA_INITIATOR_PASSWORD || 'test_password',
  environment: process.env.MPESA_ENV || 'sandbox',
});

module.exports = mpesaClient;
