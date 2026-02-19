const express = require('express');
const router = express.Router();
const { sendEmail, templates } = require('../../emailService');
const { User, PendingUser } = require('./models');
const bcrypt = require('bcryptjs');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email required' });
    }
    const tpl = templates.signUp(email);
    await sendEmail({ to: email, subject: tpl.subject, html: tpl.html });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Signup email error:', err);
    return res.status(500).json({ error: 'Failed to send signup email' });
  }
});

// POST /api/auth/reset-pin
router.post('/reset-pin', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email required' });
    }
    const base = process.env.RESET_BASE_URL || process.env.BASE_URL + '/reset' || 'https://api.lynmercan.com/reset';
    const link = `${base}?email=${encodeURIComponent(email)}`;
    const tpl = templates.passwordReset(email, link);
    await sendEmail({ to: email, subject: tpl.subject, html: tpl.html });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Reset PIN error:', err);
    return res.status(500).json({ error: 'Failed to send reset email' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, pin } = req.body;
    if (!email || !pin) return res.status(400).json({ error: 'Email and PIN required' });
    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid email or PIN' });
    const ok = await bcrypt.compare(String(pin), user.pinHash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or PIN' });
    // Do not send email on sign-in per requirements
    return res.json({ ok: true, user: { email: user.email, name: `${user.firstName} ${user.lastName}`.trim(), phone: user.phone } });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to login' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, yob, sex, phone, email, pin } = req.body;
    if (!firstName || !lastName || !email || !pin) return res.status(400).json({ error: 'Missing required fields' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });
    const normalizedEmail = String(email).trim().toLowerCase();
    const pinHash = await bcrypt.hash(String(pin), 10);
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      existing.firstName = firstName;
      existing.lastName = lastName;
      existing.yob = yob;
      existing.sex = sex;
      existing.phone = phone;
      existing.pinHash = pinHash;
      await existing.save();
    } else {
      await User.create({ firstName, lastName, yob, sex, phone, email: normalizedEmail, pinHash });
    }
    const tpl = templates.signUp(normalizedEmail);
    await sendEmail({ to: normalizedEmail, subject: tpl.subject, html: tpl.html });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Failed to register user' });
  }
});

// POST /api/auth/register-init
router.post('/register-init', async (req, res) => {
  try {
    const { firstName, lastName, yob, sex, phone, email, pin } = req.body;
    if (!firstName || !lastName || !email || !pin) return res.status(400).json({ error: 'Missing required fields' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Invalid email' });
    const normalizedEmail = String(email).trim().toLowerCase();
    const pinHash = await bcrypt.hash(String(pin), 10);

    // Try to reuse existing non-expired code to avoid invalidation during resends
    const existing = await PendingUser.findOne({ email: normalizedEmail });
    let code;
    let expiresAt;
    const now = new Date();
    if (existing && existing.expiresAt > now) {
      code = existing.code;
      expiresAt = existing.expiresAt;
      // Update other fields but keep code/expiresAt
      existing.firstName = firstName;
      existing.lastName = lastName;
      existing.yob = yob;
      existing.sex = sex;
      existing.phone = phone;
      existing.pinHash = pinHash;
      await existing.save();
    } else {
      code = String(Math.floor(100000 + Math.random() * 900000));
      expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await PendingUser.findOneAndUpdate(
        { email: normalizedEmail },
        { firstName, lastName, yob, sex, phone, email: normalizedEmail, pinHash, code, expiresAt },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    const tpl = templates.confirmationCode(normalizedEmail, code);
    await sendEmail({ to: normalizedEmail, subject: tpl.subject, html: tpl.html });
    if (String(process.env.DEBUG_CONFIRMATION || '').toLowerCase() === 'true') {
      console.log('DEBUG confirm code for', normalizedEmail, '=>', code);
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error('Register-init error:', err);
    return res.status(500).json({ error: 'Failed to send confirmation code' });
  }
});

// POST /api/auth/register-verify
router.post('/register-verify', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Missing email or code' });
    const normalizedEmail = String(email).trim().toLowerCase();
    const trimmedCode = String(code).trim();
    // Try normalized email first; if not found, try raw email (legacy records)
    let pending = await PendingUser.findOne({ email: normalizedEmail });
    if (!pending) {
      pending = await PendingUser.findOne({ email });
    }
    if (!pending) {
      console.error('[Register-verify] No pending registration for', normalizedEmail, 'or', email);
      return res.status(404).json({ error: 'No pending registration' });
    }
    if (String(pending.code).trim() !== trimmedCode) {
      console.error('[Register-verify] Code mismatch:', {
        inputCode: trimmedCode,
        storedCode: String(pending.code).trim(),
        email: pending.email,
        normalizedEmail,
        expiresAt: pending.expiresAt,
        now: new Date(),
      });
      return res.status(400).json({ error: 'Invalid code' });
    }
    if (pending.expiresAt < new Date()) {
      // Clean up both normalized and raw variants
      await PendingUser.deleteOne({ email: normalizedEmail });
      await PendingUser.deleteOne({ email });
      console.error('[Register-verify] Code expired for', pending.email, 'expired at', pending.expiresAt, 'now', new Date());
      return res.status(400).json({ error: 'Code expired' });
    }
    // Create/update user
    const { firstName, lastName, yob, sex, phone, pinHash } = pending;
    const existing = await User.findOne({ email: normalizedEmail }) || await User.findOne({ email });
    if (existing) {
      existing.firstName = firstName;
      existing.lastName = lastName;
      existing.yob = yob;
      existing.sex = sex;
      existing.phone = phone;
      existing.pinHash = pinHash;
      await existing.save();
    } else {
      await User.create({ firstName, lastName, yob, sex, phone, email: normalizedEmail, pinHash });
    }
    await PendingUser.deleteOne({ email: normalizedEmail });
    await PendingUser.deleteOne({ email });
    const tpl = templates.signUp(normalizedEmail);
    await sendEmail({ to: normalizedEmail, subject: tpl.subject, html: tpl.html });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Register-verify error:', err);
    return res.status(500).json({ error: 'Failed to verify registration' });
  }
});

module.exports = router;