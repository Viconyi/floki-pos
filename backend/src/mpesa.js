// backend/src/mpesa.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Credentials and configuration via environment variables
const consumerKey = process.env.MPESA_CONSUMER_KEY || '';
const consumerSecret = process.env.MPESA_CONSUMER_SECRET || '';
const shortcode = process.env.MPESA_SHORT_CODE || '';
const passkey = process.env.MPESA_PASSKEY || '';
const callbackUrl = process.env.MPESA_CALLBACK_URL || '';
const env = (process.env.MPESA_ENV || 'sandbox').toLowerCase();
const host = env === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';
// Always use MPESA_SHORT_CODE from .env in production; only use 174379 in sandbox if not set
const effectiveShortCode = env === 'production' ? shortcode : (shortcode || '174379');
// Optional default CPI for QR code generation (defaults to effectiveShortCode)
const qrDefaultCPI = process.env.MPESA_QR_DEFAULT_CPI || effectiveShortCode;

// Get OAuth token
async function getOAuthToken() {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const res = await axios.get(`${host}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  return res.data.access_token;
}

// Initiate STK Push
router.post('/stkpush', async (req, res) => {
  try {
    const { amount, phone } = req.body;
    // Validate required configuration
    const missing = [];
    if (!consumerKey) missing.push('MPESA_CONSUMER_KEY');
    if (!consumerSecret) missing.push('MPESA_CONSUMER_SECRET');
    if (!effectiveShortCode) missing.push('MPESA_SHORT_CODE');
    if (!passkey) missing.push('MPESA_PASSKEY');
    if (!callbackUrl) missing.push('MPESA_CALLBACK_URL');
    if (missing.length) {
      return res.status(400).json({ error: 'M-Pesa STK not configured', missing });
    }
    if (!amount || !phone) {
      return res.status(400).json({ error: 'Missing amount or phone' });
    }
    const intAmount = Math.max(1, Math.round(Number(amount)));
    const token = await getOAuthToken();
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const password = Buffer.from(effectiveShortCode + passkey + timestamp).toString('base64');
    const payload = {
      BusinessShortCode: effectiveShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: intAmount,
      PartyA: phone,
      PartyB: effectiveShortCode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: 'FlokiHotel',
      TransactionDesc: 'Order Payment',
    };
    const stkRes = await axios.post(`${host}/mpesa/stkpush/v1/processrequest`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(stkRes.data);
  } catch (err) {
    res.status(500).json({ error: err.message, details: err.response?.data });
  }
});

// Callback endpoint (to be called by Safaricom)
router.post('/callback', (req, res) => {
  // Handle payment confirmation here
  console.log('M-Pesa Callback:', req.body);
  res.json({ status: 'ok' });
});

// Generate Dynamic M-PESA QR Code
router.post('/qrcode', async (req, res) => {
  try {
    const { MerchantName, RefNo, Amount, TrxCode, CPI, Size } = req.body;
    const missing = [];
    if (!consumerKey) missing.push('MPESA_CONSUMER_KEY');
    if (!consumerSecret) missing.push('MPESA_CONSUMER_SECRET');
    if (missing.length) {
      return res.status(400).json({ error: 'M-Pesa QR not configured', missing });
    }
    if (!MerchantName) missing.push('MerchantName');
    const intAmount = Math.max(1, Math.round(Number(Amount || 0)));
    if (!intAmount) missing.push('Amount');
    const trx = (TrxCode || 'BG').toUpperCase();
    const cpi = String(CPI || qrDefaultCPI || '').trim();
    if (!cpi) missing.push('CPI');
    if (missing.length) {
      return res.status(400).json({ error: 'Missing fields', missing });
    }

    const token = await getOAuthToken();
    const payload = {
      MerchantName,
      RefNo: RefNo || 'FlokiQR',
      Amount: intAmount,
      TrxCode: trx,
      CPI: cpi,
      Size: String(Size || '300'),
    };
    const qrRes = await axios.post(`${host}/mpesa/qrcode/v1/generate`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(qrRes.data);
  } catch (err) {
    res.status(500).json({ error: err.message, details: err.response?.data });
  }
});

// Query STK Push status
router.post('/stkquery', async (req, res) => {
  try {
    const { CheckoutRequestID } = req.body;
    const missing = [];
    if (!consumerKey) missing.push('MPESA_CONSUMER_KEY');
    if (!consumerSecret) missing.push('MPESA_CONSUMER_SECRET');
    if (!effectiveShortCode) missing.push('MPESA_SHORT_CODE');
    if (!passkey) missing.push('MPESA_PASSKEY');
    if (!CheckoutRequestID) missing.push('CheckoutRequestID');
    if (missing.length) {
      return res.status(400).json({ error: 'Missing fields', missing });
    }

    const token = await getOAuthToken();
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const password = Buffer.from(effectiveShortCode + passkey + timestamp).toString('base64');

    const payload = {
      BusinessShortCode: effectiveShortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID,
    };

    const queryRes = await axios.post(`${host}/mpesa/stkpushquery/v1/query`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    res.json(queryRes.data);
  } catch (err) {
    res.status(500).json({ error: err.message, details: err.response?.data });
  }
});

module.exports = router;
