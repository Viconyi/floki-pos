const useSql = (process.env.DB_DRIVER || '').toLowerCase() === 'mysql';

let MenuItem, Till, sql;
if (useSql) {
  sql = require('../db/sql');
} else {
  ({ MenuItem, Till } = require('../modules/admin/models'));
}

async function listMenu() {
  if (useSql) {
    const p = await sql.getPool();
    const [rows] = await p.query('SELECT * FROM menu_items ORDER BY id DESC');
    return rows.map(r => ({
      _id: String(r.id),
      name: r.name,
      description: r.description,
      price: Number(r.price),
      available: !!r.available,
      image: r.image || '',
      category: r.category || 'Foods',
      type: r.type || null,
      ingredients: r.ingredients ? safeParseJsonArray(r.ingredients) : [],
      offerPercent: r.offer_percent != null ? Number(r.offer_percent) : 0,
      offerActive: !!r.offer_active
    }));
  }
  // MongoDB: include average rating for each menu item
  const items = await MenuItem.find();
  const Review = require('../modules/hotel/models').Review;
  const ratings = await Review.aggregate([
    { $group: { _id: "$menuItem", avg: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);
  const ratingMap = {};
  for (const r of ratings) {
    if (r._id) ratingMap[String(r._id)] = { avg: r.avg, count: r.count };
  }
  return items.map(it => {
    const rating = ratingMap[String(it._id)] || { avg: null, count: 0 };
    return {
      ...it.toObject(),
      rating: rating.avg ? Math.round(rating.avg * 10) / 10 : null,
      ratingCount: rating.count
    };
  });
}

async function createMenuItem(data) {
  if (useSql) {
    const p = await sql.getPool();
    const { name, description, price, available, image, category, type, ingredients, offerPercent, offerActive } = data;
    const ingredientsJson = Array.isArray(ingredients) ? JSON.stringify(ingredients) : null;
    const [res] = await p.query('INSERT INTO menu_items (name, description, price, available, image, category, type, ingredients, offer_percent, offer_active) VALUES (?,?,?,?,?,?,?,?,?,?)', [name, description || null, Number(price) || 0, !!available, image || null, category || 'Foods', type || null, ingredientsJson, offerPercent != null ? Number(offerPercent) : null, offerActive != null ? !!offerActive : false]);
    const [rows] = await p.query('SELECT * FROM menu_items WHERE id=?', [res.insertId]);
    const r = rows[0];
    return { _id: String(r.id), name: r.name, description: r.description, price: Number(r.price), available: !!r.available, image: r.image || '', category: r.category || 'Foods', type: r.type || null, ingredients: r.ingredients ? safeParseJsonArray(r.ingredients) : [], offerPercent: r.offer_percent != null ? Number(r.offer_percent) : 0, offerActive: !!r.offer_active };
  }
  const item = new MenuItem(data);
  await item.save();
  return item;
}

async function updateMenuItem(id, data) {
  if (useSql) {
    const p = await sql.getPool();
    const mappings = [
      { key: 'name', col: 'name' },
      { key: 'description', col: 'description' },
      { key: 'price', col: 'price' },
      { key: 'available', col: 'available' },
      { key: 'image', col: 'image' },
      { key: 'category', col: 'category' },
      { key: 'type', col: 'type' },
      { key: 'ingredients', col: 'ingredients' },
      { key: 'offerPercent', col: 'offer_percent' },
      { key: 'offerActive', col: 'offer_active' },
    ];
    const sets = [];
    const vals = [];
    for (const { key, col } of mappings) {
      if (key in data) {
        sets.push(`${col}=?`);
        let v = data[key];
        if (key === 'price') v = Number(v) || 0;
        else if (key === 'available') v = !!v;
        else if (key === 'ingredients') v = Array.isArray(v) ? JSON.stringify(v) : null;
        else if (key === 'offerPercent') v = v != null ? Number(v) : null;
        else if (key === 'offerActive') v = !!v;
        vals.push(v);
      }
    }
    if (!sets.length) {
      const [rows] = await p.query('SELECT * FROM menu_items WHERE id=?', [id]);
      const r = rows[0];
      return r ? { _id: String(r.id), name: r.name, description: r.description, price: Number(r.price), available: !!r.available, image: r.image || '', category: r.category || 'Foods', type: r.type || null, ingredients: r.ingredients ? safeParseJsonArray(r.ingredients) : [], offerPercent: r.offer_percent != null ? Number(r.offer_percent) : 0, offerActive: !!r.offer_active } : null;
    }
    vals.push(id);
    await p.query(`UPDATE menu_items SET ${sets.join(', ')} WHERE id=?`, vals);
    const [rows] = await p.query('SELECT * FROM menu_items WHERE id=?', [id]);
    const r = rows[0];
    return r ? { _id: String(r.id), name: r.name, description: r.description, price: Number(r.price), available: !!r.available, image: r.image || '', category: r.category || 'Foods', type: r.type || null, ingredients: r.ingredients ? safeParseJsonArray(r.ingredients) : [], offerPercent: r.offer_percent != null ? Number(r.offer_percent) : 0, offerActive: !!r.offer_active } : null;
  }
  return MenuItem.findByIdAndUpdate(id, data, { new: true });
}

async function deleteMenuItem(id) {
  if (useSql) {
    const p = await sql.getPool();
    await p.query('DELETE FROM menu_items WHERE id=?', [id]);
    return;
  }
  await MenuItem.findByIdAndDelete(id);
}

async function getTill() {
  if (useSql) {
    const p = await sql.getPool();
    const [rows] = await p.query('SELECT * FROM tills LIMIT 1');
    const r = rows[0];
    if (!r) return null;
    return { _id: String(r.id), tillNumber: r.till_number, businessName: r.business_name, active: !!r.active };
  }
  return Till.findOne();
}

async function updateTill(data) {
  if (useSql) {
    const p = await sql.getPool();
    const [rows] = await p.query('SELECT id FROM tills LIMIT 1');
    if (rows.length === 0) {
      await p.query('INSERT INTO tills (till_number, business_name, active) VALUES (?,?,?)', [data.tillNumber || null, data.businessName || null, data.active != null ? !!data.active : true]);
    } else {
      await p.query('UPDATE tills SET till_number=?, business_name=?, active=? WHERE id=?', [data.tillNumber || null, data.businessName || null, data.active != null ? !!data.active : true, rows[0].id]);
    }
    return getTill();
  }
  return Till.findOneAndUpdate({}, data, { new: true, upsert: true });
}

module.exports = { listMenu, createMenuItem, updateMenuItem, deleteMenuItem, getTill, updateTill };
function safeParseJsonArray(s) {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
