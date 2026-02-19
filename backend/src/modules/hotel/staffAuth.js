const express = require('express');
const router = express.Router();
const { StaffUser } = require('../admin/models');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// In-memory session store (simple dev-use). Map token -> { userId, username, role }
const sessions = new Map();

function createToken(payload) {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, { ...payload, createdAt: Date.now() });
  return token;
}

function destroyToken(token) {
  sessions.delete(token);
}

// POST /api/hotel/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, pin } = req.body;
    if (!username || !pin) return res.status(400).json({ error: 'Username and PIN required' });
    const normalized = String(username).trim().toLowerCase();
    const staff = await StaffUser.findOne({ username: normalized, active: true });
    if (!staff) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(String(pin), staff.pinHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = createToken({ userId: staff._id.toString(), username: staff.username, role: staff.role });
    return res.json({
      token,
      user: {
        id: staff._id,
        username: staff.username,
        name: staff.name,
        firstName: staff.firstName || null,
        lastName: staff.lastName || null,
        role: staff.role,
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/hotel/auth/logout
router.post('/logout', async (req, res) => {
  try {
    const token = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '');
    if (token) destroyToken(token);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Middleware example to protect endpoints (not applied yet)
function requireStaffAuth(req, res, next) {
  const token = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '');
  if (!token || !sessions.has(token)) return res.status(401).json({ error: 'Unauthorized' });
  req.staff = sessions.get(token);
  next();
}

module.exports = { router, requireStaffAuth };
