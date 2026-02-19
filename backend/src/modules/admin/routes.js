const express = require('express');
const router = express.Router();
const adminRepo = require('../../repo/adminRepo');
const { StaffUser } = require('./models');
const bcrypt = require('bcryptjs');

// Get all menu items
router.get('/menu', async (req, res) => {
  try {
    const menu = await adminRepo.listMenu();
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new menu item
router.post('/menu', async (req, res) => {
  try {
    const item = await adminRepo.createMenuItem(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a menu item
router.put('/menu/:id', async (req, res) => {
  try {
    const item = await adminRepo.updateMenuItem(req.params.id, req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a menu item
router.delete('/menu/:id', async (req, res) => {
  try {
    await adminRepo.deleteMenuItem(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get till info
router.get('/till', async (req, res) => {
  try {
    const till = await adminRepo.getTill();
    res.json(till);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update till info
router.put('/till', async (req, res) => {
  try {
    const till = await adminRepo.updateTill(req.body);
    res.json(till);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Initiate MPESA till payment
router.post('/mpesa/pay', async (req, res) => {
  try {
    const { amount, phone, tillNumber } = req.body;
    // Initiate payment using mpesaClient
    const response = await mpesaClient.c2bSimulate({
      ShortCode: tillNumber,
      Amount: amount,
      Msisdn: phone,
      CommandID: 'CustomerPayBillOnline',
    });
    res.json({ success: true, response });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Staff management (admin-only)
router.get('/staff', async (req, res) => {
  try {
    const staff = await StaffUser.find().sort({ createdAt: -1 });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/staff', async (req, res) => {
  try {
    const { username, firstName, lastName, name, role, pin } = req.body;
    if (!username || !pin) return res.status(400).json({ error: 'Username and PIN required' });
    // Require first and last name; allow legacy 'name' only if provided but prefer split
    const fn = typeof firstName === 'string' ? firstName.trim() : '';
    const ln = typeof lastName === 'string' ? lastName.trim() : '';
    const legacyName = typeof name === 'string' ? name.trim() : '';
    if (!fn || !ln) {
      if (!legacyName) return res.status(400).json({ error: 'First and Last name required' });
      // Attempt simple split from legacy name
      const parts = legacyName.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        parts[0] && (req.body.firstName = parts[0]);
        parts.slice(1).join(' ') && (req.body.lastName = parts.slice(1).join(' '));
      } else {
        req.body.firstName = legacyName;
        req.body.lastName = '';
      }
    }
    const normalized = String(username).trim().toLowerCase();
    const pinHash = await bcrypt.hash(String(pin), 10);
    const existing = await StaffUser.findOne({ username: normalized });
    if (existing) return res.status(409).json({ error: 'Username already exists' });
    const composite = (req.body.firstName ? req.body.firstName : fn) + (req.body.lastName || ln ? ' ' + (req.body.lastName ? req.body.lastName : ln) : '');
    const doc = await StaffUser.create({
      username: normalized,
      firstName: req.body.firstName || fn,
      lastName: req.body.lastName || ln,
      name: composite.trim(),
      role: role || 'staff',
      pinHash,
      active: true,
    });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/staff/:id', async (req, res) => {
  try {
    const { firstName, lastName, name, role, active, pin } = req.body;
    const update = {};
    if (firstName != null) update.firstName = firstName;
    if (lastName != null) update.lastName = lastName;
    if (name != null) update.name = name;
    // If first/last provided, also refresh composite name
    const fn = typeof firstName === 'string' ? firstName.trim() : undefined;
    const ln = typeof lastName === 'string' ? lastName.trim() : undefined;
    if (fn != null || ln != null) {
      const current = await StaffUser.findById(req.params.id).lean();
      const useFn = fn != null ? fn : (current && current.firstName) || '';
      const useLn = ln != null ? ln : (current && current.lastName) || '';
      update.name = `${useFn}${useLn ? ' ' + useLn : ''}`.trim();
    }
    if (role != null) update.role = role;
    if (active != null) update.active = !!active;
    if (pin != null) update.pinHash = await bcrypt.hash(String(pin), 10);
    const doc = await StaffUser.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/staff/:id', async (req, res) => {
  try {
    await StaffUser.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
