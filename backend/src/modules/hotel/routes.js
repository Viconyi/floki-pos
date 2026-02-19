
// ETR generation (single and bulk, no personal details)
const express = require('express');
const router = express.Router();
const { buildETRReceiptHTML, sendEmail, templates } = require('../../emailService');
const hotelRepo = require('../../repo/hotelRepo');
const { Order } = require('./models');
const { User: ClientUser } = require('../client/models');

// Generate ETR for a single order (no personal details)
router.get('/etr/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('items.menuItem');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    // Remove personal details
    const generalOrder = order.toObject();
    delete generalOrder.clientName;
    delete generalOrder.clientEmail;
    delete generalOrder.clientPhone;
    const html = buildETRReceiptHTML({ ...generalOrder, createdAt: order.createdAt });
    res.set('Content-Type', 'text/html').send(html);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk ETR generation (returns array of HTML receipts)
router.post('/etr/bulk', async (req, res) => {
  try {
    const { orderIds } = req.body;
    if (!Array.isArray(orderIds) || !orderIds.length) return res.status(400).json({ error: 'orderIds required' });
    const orders = await Order.find({ _id: { $in: orderIds } }).populate('items.menuItem');
    const etrs = orders.map(order => {
      const generalOrder = order.toObject();
      delete generalOrder.clientName;
      delete generalOrder.clientEmail;
      delete generalOrder.clientPhone;
      return { orderId: order._id, etr: buildETRReceiptHTML({ ...generalOrder, createdAt: order.createdAt }) };
    });
    res.json(etrs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Normalize order status to client-facing labels
function normalizeStatus(s) {
  if (!s) return 'Placed';
  const t = String(s).toLowerCase().replace(/[\s_]+/g, '');
  switch (t) {
    case 'pending':
    case 'placed':
      return 'Pending';
    case 'preparing':
    case 'prep':
      return 'Preparing';
    case 'ready':
      return 'Ready';
    case 'ontheway':
    case 'delivery':
    case 'delivering':
      return 'On the Way';
    case 'delivered':
      return 'Delivered';
    case 'completed':
      return 'Completed';
    case 'cancelled':
    case 'canceled':
      return 'Cancelled';
    default:
      return s;
  }
}

// Orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await hotelRepo.listOrders();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/orders', async (req, res) => {
  try {
    const body = { ...(req.body || {}) };
    // Ensure clientName is populated when available
    const email = (body.clientEmail || '').trim();
    const name = (body.clientName || '').trim();
    if (email) {
      const nameLooksLikeEmail = name && /@/.test(name);
      if (!name || nameLooksLikeEmail) {
        try {
          const u = await ClientUser.findOne({ email });
          if (u) {
            body.clientName = `${(u.firstName || '').trim()} ${(u.lastName || '').trim()}`.trim() || email;
            body.clientPhone = body.clientPhone || u.phone || undefined;
          }
        } catch {}
      }
    }
    const order = await hotelRepo.createOrder(body);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/orders/:id', async (req, res) => {
  try {
    const order = await hotelRepo.updateOrder(req.params.id, req.body);
    // Emit real-time status update
    const io = req.app.get('io');
    if (io && order) {
      io.emit('orderStatusUpdate', {
        orderId: order._id,
        status: normalizeStatus(order.status),
        etaMinutes: order.etaMinutes,
        driver: order.driver,
        servedByName: order.servedByName,
      });
    }
    if (order && !order.receiptSent && order.clientEmail) {
      const normalized = normalizeStatus(order.status);
      const isFinal = normalized === 'Completed' || normalized === 'Delivered';
      if (isFinal) {
        const populated = await Order.findById(order._id).populate('items.menuItem');
        try {
          const tpl = templates.etrReceipt(populated);
          await sendEmail({ to: order.clientEmail, subject: tpl.subject, html: tpl.html });
          await Order.findByIdAndUpdate(order._id, { receiptSent: true });
        } catch (e) {
          console.error('Receipt email error:', e.message);
        }
      }
    }
    res.json(order);
  } catch (err) {
    if (err.message && err.message.includes('Invalid status transition for pickup order')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// Offers
router.get('/offers', async (req, res) => {
  try {
    const offers = await hotelRepo.listOffers();
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/offers', async (req, res) => {
  try {
    const offer = await hotelRepo.createOffer(req.body);
    res.status(201).json(offer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/offers/:id', async (req, res) => {
  try {
    const offer = await hotelRepo.updateOffer(req.params.id, req.body);
    res.json(offer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/offers/:id', async (req, res) => {
  try {
    await hotelRepo.deleteOffer(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Hotel configuration (utensils/condiments)
router.get('/config', async (req, res) => {
  try {
    const cfg = await hotelRepo.getConfig();
    res.json({ utensils: cfg.utensils || [], condiments: cfg.condiments || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/config', async (req, res) => {
  try {
    const cfg = await hotelRepo.updateConfig(req.body || {});
    res.json({ utensils: cfg.utensils || [], condiments: cfg.condiments || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
// Reviews
router.get('/reviews', async (req, res) => {
  try {
    const { menuItem } = req.query;
    const reviews = await hotelRepo.listReviews(menuItem);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/reviews', async (req, res) => {
  try {
    const review = await hotelRepo.createReview(req.body);
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
