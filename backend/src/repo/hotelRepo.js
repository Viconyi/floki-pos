const useSql = (process.env.DB_DRIVER || '').toLowerCase() === 'mysql';

let Order, Offer, HotelConfig, Review, sql;
if (useSql) {
  sql = require('../db/sql');
} else {
  ({ Order, Offer, HotelConfig, Review } = require('../modules/hotel/models'));
}

async function listOrders() {
  if (useSql) {
    const p = await sql.getPool();
    const [orders] = await p.query('SELECT * FROM orders ORDER BY id DESC');
    const ids = orders.map(o => o.id);
    let itemsByOrder = {};
    if (ids.length) {
      const [items] = await p.query(`SELECT oi.*, mi.name as menu_name, mi.price as menu_price FROM order_items oi LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id WHERE oi.order_id IN (${ids.map(()=>'?').join(',')})`, ids);
      for (const it of items) {
        if (!itemsByOrder[it.order_id]) itemsByOrder[it.order_id] = [];
        itemsByOrder[it.order_id].push({
          menuItem: { _id: String(it.menu_item_id), name: it.menu_name, price: Number(it.menu_price) },
          quantity: it.quantity,
        });
      }
    }
    return orders.map(o => ({
      _id: String(o.id),
      items: itemsByOrder[o.id] || [],
      clientName: o.client_name,
      clientPhone: o.client_phone,
      deliveryAddress: o.delivery_address,
      status: o.status,
      etaMinutes: o.eta_minutes != null ? Number(o.eta_minutes) : null,
      total: Number(o.total || 0),
      paymentStatus: o.payment_status,
      createdAt: o.created_at,
    }));
  }
  return Order.find().populate('items.menuItem');
}

async function createOrder(payload) {
  if (useSql) {
    const p = await sql.getPool();
    const [res] = await p.query(
      'INSERT INTO orders (client_name, client_phone, delivery_address, status, total, payment_status) VALUES (?,?,?,?,?,?)',
      [payload.clientName || null, payload.clientPhone || null, payload.deliveryAddress || null, payload.status || 'pending', Number(payload.total || 0), payload.paymentStatus || 'pending']
    );
    const orderId = res.insertId;
    const items = payload.items || [];
    for (const it of items) {
      const menuId = (it.menuItem && (it.menuItem._id || it.menuItem.id)) || it.menuItem || null;
      await p.query('INSERT INTO order_items (order_id, menu_item_id, quantity) VALUES (?,?,?)', [orderId, menuId, Number(it.quantity || 1)]);
    }
    const [row] = await p.query('SELECT * FROM orders WHERE id=?', [orderId]);
    return { _id: String(orderId), ...row[0] };
  }
  const order = new Order(payload);
  await order.save();
  return order;
}

async function updateOrder(id, payload) {
  if (useSql) {
    const p = await sql.getPool();
    const fields = ['client_name','client_phone','delivery_address','status','total','payment_status','eta_minutes','confirmed','confirmed_at'];
    const map = { client_name:'clientName', client_phone:'clientPhone', delivery_address:'deliveryAddress', status:'status', total:'total', payment_status:'paymentStatus', eta_minutes:'etaMinutes', confirmed:'confirmed', confirmed_at:'confirmedAt' };
    const sets = [];
    const vals = [];
    for (const f of fields) {
      const key = map[f];
      if (key in payload) {
        let v = payload[key];
        if (f === 'total') v = Number(payload[key] || 0);
        else if (f === 'eta_minutes') v = payload[key] == null ? null : Number(payload[key]);
        else if (f === 'confirmed') v = !!payload[key];
        else if (f === 'confirmed_at') v = payload[key] || new Date();
        sets.push(`${f}=?`);
        vals.push(v);
      }
    }
    // Auto-confirm when moving to preparing
    if ('status' in payload && payload.status === 'preparing') {
      sets.push('confirmed=?');
      vals.push(true);
      sets.push('confirmed_at=?');
      vals.push(new Date());
    }
    if (sets.length) {
      vals.push(id);
      await p.query(`UPDATE orders SET ${sets.join(', ')} WHERE id=?`, vals);
    }
    const [rows] = await p.query('SELECT * FROM orders WHERE id=?', [id]);
    const o = rows[0];
    if (!o) return null;
    return {
      _id: String(o.id),
      clientName: o.client_name,
      clientPhone: o.client_phone,
      deliveryAddress: o.delivery_address,
      status: o.status,
      etaMinutes: o.eta_minutes != null ? Number(o.eta_minutes) : null,
      total: Number(o.total || 0),
      paymentStatus: o.payment_status,
      createdAt: o.created_at,
    };
  }
  // Enforce status flow for pickup orders
  const order = await Order.findById(id);
  if (!order) return null;
  const isPickup = order.deliveryType === 'Pickup';
  if (isPickup && payload.status) {
    const allowed = ['pending', 'preparing', 'ready', 'completed'];
    const currentIdx = allowed.indexOf(String(order.status).toLowerCase());
    const nextIdx = allowed.indexOf(String(payload.status).toLowerCase());
    // Only allow forward transitions in allowed sequence
    if (nextIdx === -1 || nextIdx < currentIdx) {
      throw new Error('Invalid status transition for pickup order');
    }
  }
  return Order.findByIdAndUpdate(id, payload, { new: true });
}

async function listOffers() {
  if (useSql) {
    const p = await sql.getPool();
    const [rows] = await p.query('SELECT * FROM offers ORDER BY id DESC');
    return rows.map(r => ({ _id: String(r.id), title: r.title, description: r.description, discount: Number(r.discount||0), validFrom: r.valid_from, validTo: r.valid_to, active: !!r.active }));
  }
  return Offer.find();
}

async function createOffer(data) {
  if (useSql) {
    const p = await sql.getPool();
    const [res] = await p.query('INSERT INTO offers (title, description, discount, valid_from, valid_to, active) VALUES (?,?,?,?,?,?)', [data.title, data.description || null, Number(data.discount||0), data.validFrom || null, data.validTo || null, data.active != null ? !!data.active : true]);
    const [rows] = await p.query('SELECT * FROM offers WHERE id=?', [res.insertId]);
    const r = rows[0];
    return { _id: String(r.id), title: r.title, description: r.description, discount: Number(r.discount||0), validFrom: r.valid_from, validTo: r.valid_to, active: !!r.active };
  }
  const offer = new Offer(data);
  await offer.save();
  return offer;
}

async function updateOffer(id, data) {
  if (useSql) {
    const p = await sql.getPool();
    const fields = ['title','description','discount','valid_from','valid_to','active'];
    const map = { title:'title', description:'description', discount:'discount', valid_from:'validFrom', valid_to:'validTo', active:'active' };
    const sets = [];
    const vals = [];
    for (const f of fields) if (map[f] in data) { sets.push(`${f}=?`); vals.push(f==='discount'?Number(data[map[f]]||0): data[map[f]]); }
    if (sets.length) { vals.push(id); await p.query(`UPDATE offers SET ${sets.join(', ')} WHERE id=?`, vals); }
    const [rows] = await p.query('SELECT * FROM offers WHERE id=?', [id]);
    const r = rows[0];
    return r ? { _id: String(r.id), title: r.title, description: r.description, discount: Number(r.discount||0), validFrom: r.valid_from, validTo: r.valid_to, active: !!r.active } : null;
  }
  return Offer.findByIdAndUpdate(id, data, { new: true });
}

async function deleteOffer(id) {
  if (useSql) {
    const p = await sql.getPool();
    await p.query('DELETE FROM offers WHERE id=?', [id]);
    return;
  }
  await Offer.findByIdAndDelete(id);
}

module.exports = { listOrders, createOrder, updateOrder, listOffers, createOffer, updateOffer, deleteOffer };

// Hotel configuration (MongoDB only; SQL returns defaults)
async function getConfig() {
  if (useSql) {
    return { utensils: [], condiments: [] };
  }
  let cfg = await HotelConfig.findOne();
  if (!cfg) {
    cfg = new HotelConfig({ utensils: [], condiments: [] });
    await cfg.save();
  }
  return cfg;
}

async function updateConfig(data) {
  if (useSql) {
    return { utensils: [], condiments: [] };
  }
  const clean = arr => Array.from(new Set((Array.isArray(arr) ? arr : []).map(x => String(x).trim()).filter(Boolean)));
  let cfg = await HotelConfig.findOne();
  if (!cfg) cfg = new HotelConfig();
  if ('utensils' in data) cfg.utensils = clean(data.utensils);
  if ('condiments' in data) cfg.condiments = clean(data.condiments);
  await cfg.save();
  return cfg;
}

module.exports.getConfig = getConfig;
module.exports.updateConfig = updateConfig;

// Reviews
async function listReviews(menuItemId) {
  if (useSql) {
    return [];
  }
  const q = {};
  if (menuItemId) q.menuItem = menuItemId;
  // Populate menuItem and orderId for richer review info
  return Review.find(q)
    .populate({ path: 'menuItem', select: 'name image photo' })
    .populate({ path: 'orderId', select: 'clientName' })
    .sort({ createdAt: -1 });
}

async function createReview(data) {
  if (useSql) {
    return { _id: '0', ...data };
  }
  const review = new Review(data);
  await review.save();
  return review;
}

module.exports.listReviews = listReviews;
module.exports.createReview = createReview;
