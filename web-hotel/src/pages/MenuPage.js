import React, { useEffect, useState, useRef } from 'react';
import { HotelAPI } from '../api';

function ItemCard({ item, onEdit, onDelete, onOffer, index }) {
  const hasOffer = !!item.offerActive && Number(item.offerPercent || 0) > 0;
  const discounted = hasOffer ? Number(item.price || 0) * (1 - Number(item.offerPercent || 0) / 100) : null;
  return (
    <li style={{
      background: '#f7f7fa',
      borderRadius: 12,
      padding: 20,
      boxShadow: '0 1px 8px #0001',
      display: 'flex',
      alignItems: 'center',
      minHeight: 120,
      flexDirection: 'column',
      listStyle: 'none',
      maxWidth: 420,
      width: '100%',
      justifySelf: 'center'
    }}>
      {item.category === 'Foods' && item.image && (
        <div style={{ width: '100%', marginBottom: 10 }}>
          <img src={item.image} alt={item.name} style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8 }} />
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, width: '100%', justifyContent: 'space-between' }}>
        {index && (
          <span style={{ background: '#1a2236', color: '#fff', borderRadius: 999, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12 }}>{index}</span>
        )}
        <div style={{ fontWeight: 700, fontSize: 20 }}>{item.name}</div>
      </div>
      {item.category === 'Foods' && (
        <div style={{ color: '#555', marginBottom: 6 }}>{item.description}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {!hasOffer ? (
          <div style={{ fontWeight: 600, color: '#ffb300', fontSize: 17 }}>Ksh {Number(item.price || 0).toFixed(2)}</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ textDecoration: 'line-through', color: '#6a708a', fontSize: 15 }}>Ksh {Number(item.price || 0).toFixed(2)}</div>
            <div style={{ fontWeight: 700, color: '#1a2236', fontSize: 18 }}>Ksh {Number(discounted || 0).toFixed(2)}</div>
            <span style={{ background: '#ffefe0', color: '#b85600', borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>{Number(item.offerPercent || 0)}% OFF</span>
          </div>
        )}
        {item.category === 'Foods' && (
          <span style={{ padding: '2px 8px', borderRadius: 999, background: item.available ? '#ddf6e5' : '#ffe9e6', color: item.available ? '#1c7d42' : '#b23b2e', fontSize: 12 }}>
            {item.available ? 'Available' : 'Unavailable'}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <button onClick={() => onEdit(item)} style={{ background: '#1a2236', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
        <button onClick={() => onOffer(item)} style={{ background: '#ffb300', color: '#1a2236', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Offer</button>
        <button onClick={() => onDelete(item)} style={{ background: '#b23b2e', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
      </div>
    </li>
  );
}

function Editor({ initial, onSave, onCancel, creating, isFoods, currentType }) {
  const [form, setForm] = useState(() => initial ? { category: initial.category || 'Foods', type: initial.type || 'Breakfast', ingredients: Array.isArray(initial.ingredients) ? initial.ingredients : [], ...initial } : { name: '', description: '', price: '', available: true, image: '', category: 'Foods', type: 'Breakfast', ingredients: [] });
  const fileInputRef = useRef(null);
  function update(k, v) { setForm(prev => ({ ...prev, [k]: v })); }
  function handlePickImage() {
    if (fileInputRef.current) fileInputRef.current.click();
  }
  function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      update('image', ev.target.result);
    };
    reader.onerror = () => alert('Failed to read image file.');
    reader.readAsDataURL(file);
  }
  async function submit(e) {
    e.preventDefault();
    const payload = { ...form, price: Number(form.price || 0) };
    if (isFoods) {
      payload.ingredients = (Array.isArray(payload.ingredients) ? payload.ingredients : [])
        .map(s => String(s || '').trim())
        .filter(Boolean);
    }
    try {
      await onSave(payload);
    } catch (err) {
      alert((err && err.message) || 'Failed to save item. Is the backend running on port 5000?');
    }
  }
  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
      {/* Image placeholder only for Foods */}
      {isFoods && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div onClick={handlePickImage} role="button" aria-label="Add image" title="Add image"
                 style={{ width: 140, height: 140, borderRadius: 12, background: '#e6e9f2', overflow: 'hidden', position: 'relative', cursor: 'pointer', boxShadow: 'inset 0 0 0 2px #d6dae6' }}>
              {form.image ? (
                <img src={form.image} alt="Item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#1a2236' }}>
                  <span style={{ fontSize: 42, fontWeight: 800 }}>+</span>
                </div>
              )}
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
        </>
      )}
      {/* No Type selector in Foods editor; type comes from sub-sub menu */}
      {isFoods && (
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>Ingredients (one per line)</label>
          <textarea
            value={(form.ingredients || []).join('\n')}
            onChange={e => {
              const raw = e.target.value;
              const arr = raw.split(/\n/);
              update('ingredients', arr);
            }}
            rows={5}
            style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e1e4ee' }}
          />
          {(form.ingredients || []).length > 0 && (
            <ul style={{ marginTop: 8, paddingLeft: 18 }}>
              {(form.ingredients || []).map((ing, i) => (
                <li key={i} style={{ color: '#1a2236' }}>{ing}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {/* No Category/Type controls in editor; context comes from tabs */}
      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>Item</label>
        <input value={form.name} onChange={e => update('name', e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e1e4ee' }} />
      </div>
      {isFoods && (
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>Description</label>
          <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e1e4ee' }} />
        </div>
      )}
      <div>
        <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>Price</label>
        <input type="number" step="0.01" min="0" value={form.price} onChange={e => update('price', e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e1e4ee' }} />
      </div>
      {isFoods && (
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>Available</label>
          <select value={String(form.available)} onChange={e => update('available', e.target.value === 'true')} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e1e4ee' }}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #dfe3ee', background: '#fff' }}>Cancel</button>
        <button type="submit" style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#1a2236', color: '#fff' }}>Save</button>
      </div>
    </form>
  );
}

export default function MenuPage() {
  const categories = ['Foods', 'Utilities', 'Condiments', 'Packaging'];
  const [selectedCategory, setSelectedCategory] = useState('Foods');
  const types = ['Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Supper', 'Specials'];
  const [selectedType, setSelectedType] = useState('Breakfast');
  const [specialsType, setSpecialsType] = useState('all');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [offerEditing, setOfferEditing] = useState(null);
  const [offerPercent, setOfferPercent] = useState('');
  const [offerActive, setOfferActive] = useState(true);
  const [query, setQuery] = useState('');


  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await HotelAPI.listMenu();
      setItems(data);
    } catch (e) {
      setError(e.message || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave(payload) {
    if (!payload.category) payload.category = selectedCategory;
    if (payload.category === 'Foods' && !payload.type) payload.type = selectedType;
    // Remove Foods-only fields when saving non-Foods items
    if (payload.category !== 'Foods') {
      ['type', 'ingredients', 'image', 'description', 'available'].forEach(k => {
        if (k in payload) delete payload[k];
      });
    }
    if (editing) {
      const updated = await HotelAPI.updateMenuItem(editing._id, payload);
      setItems(prev => prev.map(i => (i._id === updated._id ? updated : i)));
      setEditing(null);
    } else {
      const created = await HotelAPI.createMenuItem(payload);
      setItems(prev => [created, ...prev]);
      setCreating(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete ${item.name}?`)) return;
    await HotelAPI.deleteMenuItem(item._id);
    setItems(prev => prev.filter(i => i._id !== item._id));
  }

  function handleOfferOpen(item) {
    setOfferEditing(item);
    setOfferPercent(String(item.offerPercent != null ? item.offerPercent : ''));
    setOfferActive(!!item.offerActive);
  }

  async function handleOfferSave() {
    if (!offerEditing) return;
    const val = offerPercent === '' ? null : Number(offerPercent);
    const updated = await HotelAPI.updateMenuItem(offerEditing._id, { offerPercent: val, offerActive });
    setItems(prev => prev.map(i => (i._id === updated._id ? updated : i)));
    setOfferEditing(null);
  }

  async function handleOfferDisable() {
    if (!offerEditing) return;
    const updated = await HotelAPI.updateMenuItem(offerEditing._id, { offerPercent: null, offerActive: false });
    setItems(prev => prev.map(i => (i._id === updated._id ? updated : i)));
    setOfferEditing(null);
  }

  // No client-side seeding; Specials come from backend items

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <h2 style={{ margin: 0, color: '#1a2236' }}>Menu</h2>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="search"
            placeholder="Search items…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e1e4ee', minWidth: 220 }}
          />
          {!creating && !editing && (
            <button
              onClick={() => setCreating(true)}
              style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#1a2236', color: '#fff' }}
            >
              Add {selectedCategory === 'Foods' ? selectedType : selectedCategory} Item
            </button>
          )}
          <button onClick={load} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #dfe3ee', background: '#fff' }}>Refresh</button>
        </div>
      </div>
      {/* Submenu tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => { setSelectedCategory(cat); }}
                  style={{ padding: '8px 14px', borderRadius: 999, border: selectedCategory === cat ? 'none' : '1px solid #dfe3ee', background: selectedCategory === cat ? '#1a2236' : '#fff', color: selectedCategory === cat ? '#fff' : '#1a2236', fontWeight: 600 }}>
            {cat}
          </button>
        ))}
      </div>
      {/* Sub-sub menus for Foods */}
      {selectedCategory === 'Foods' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {types.map(t => (
            <button key={t} onClick={() => setSelectedType(t)}
                    style={{ padding: '6px 12px', borderRadius: 999, border: selectedType === t ? 'none' : '1px solid #dfe3ee', background: selectedType === t ? '#ffb300' : '#fff', color: selectedType === t ? '#1a2236' : '#1a2236', fontWeight: 600 }}>
              {t}
            </button>
          ))}
        </div>
      )}
      {/* Sub-sub menus for Specials under Foods */}
      {selectedCategory === 'Foods' && selectedType === 'Specials' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {['all', 'chef', 'day', 'vegan', 'vegetarian'].map(t => (
            <button key={t} onClick={() => setSpecialsType(t)}
                    style={{ padding: '6px 12px', borderRadius: 999, border: specialsType === t ? 'none' : '1px solid #dfe3ee', background: specialsType === t ? '#ffb300' : '#fff', color: '#1a2236', fontWeight: 600 }}>
              {t === 'all' ? 'All' : t === 'chef' ? "Chef's Special" : t === 'day' ? "Day's Special" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      )}
      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}

      {(creating || editing) && (
        <div style={{ border: '1px solid #e8ebf4', borderRadius: 12, padding: 16, marginBottom: 16, background: '#fafbfe' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>{editing ? 'Edit Item' : 'New Item'}</div>
          <Editor
            creating={!editing && creating}
            isFoods={selectedCategory === 'Foods'}
            currentType={selectedType}
            initial={editing || (creating ? { category: selectedCategory, type: selectedCategory === 'Foods' ? selectedType : undefined } : undefined)}
            onSave={handleSave}
            onCancel={() => { setCreating(false); setEditing(null); }}
          />
        </div>
      )}

      {offerEditing && (
        <div style={{ border: '1px solid #e8ebf4', borderRadius: 12, padding: 16, marginBottom: 16, background: '#fff7e6' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Set Offer for {offerEditing.name}</div>
          <div style={{ display: 'grid', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>Percent Off</label>
              <input type="number" min="0" max="100" step="0.01" value={offerPercent}
                     onChange={e => setOfferPercent(e.target.value)}
                     style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e1e4ee' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input id="offer-active" type="checkbox" checked={offerActive} onChange={e => setOfferActive(e.target.checked)} />
              <label htmlFor="offer-active">Offer Active</label>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setOfferEditing(null)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #dfe3ee', background: '#fff' }}>Cancel</button>
              <button type="button" onClick={handleOfferDisable} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#b23b2e', color: '#fff' }}>Disable</button>
              <button type="button" onClick={handleOfferSave} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#ffb300', color: '#1a2236' }}>Save Offer</button>
            </div>
          </div>
        </div>
      )}

      {/* Items list for non-Foods categories */}
      {selectedCategory !== 'Foods' && (
      <ul style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        justifyItems: 'center',
        gap: 20,
        width: '100%',
      }}>
        {items
          .filter(item => (item.category || 'Foods') === selectedCategory)
          .filter(item => {
            const q = query.trim().toLowerCase();
            if (!q) return true;
            const fields = [item.name, item.description, item.category, item.type, String(item.price)]
              .concat(Array.isArray(item.ingredients) ? item.ingredients : []);
            return fields.filter(Boolean).some(f => String(f).toLowerCase().includes(q));
          })
          .map((item, idx) => (
          <ItemCard key={item._id} item={item} onEdit={setEditing} onDelete={handleDelete} onOffer={handleOfferOpen} index={idx + 1} />
        ))}
      </ul>
      )}

      {/* Items list for Foods standard types (non-Specials) */}
      {selectedCategory === 'Foods' && selectedType !== 'Specials' && (
      <ul style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        justifyItems: 'center',
        gap: 20,
        width: '100%',
      }}>
        {items
          .filter(item => (item.category || 'Foods') === 'Foods')
          .filter(item => {
            const it = item.type || 'Breakfast';
            return it === selectedType;
          })
          .filter(item => {
            const q = query.trim().toLowerCase();
            if (!q) return true;
            const fields = [item.name, item.description, item.category, item.type, String(item.price)]
              .concat(Array.isArray(item.ingredients) ? item.ingredients : []);
            return fields.filter(Boolean).some(f => String(f).toLowerCase().includes(q));
          })
          .map((item, idx) => (
          <ItemCard key={item._id} item={item} onEdit={setEditing} onDelete={handleDelete} onOffer={handleOfferOpen} index={idx + 1} />
        ))}
      </ul>
      )}
      {/* Specials list under Foods (backend items only) */}
      {selectedCategory === 'Foods' && selectedType === 'Specials' && (
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          justifyItems: 'center',
          gap: 20,
          width: '100%',
        }}>
          {items
            .filter(i => (i.category || '') === 'Foods' && (i.type || '') === 'Specials')
            .filter(i => {
              // Optional sub-filter by specialsType using simple heuristics on name/description
              const text = `${i.name || ''} ${i.description || ''}`.toLowerCase();
              if (specialsType === 'all') return true;
              if (specialsType === 'chef') return text.includes('chef');
              if (specialsType === 'day') return text.includes('day');
              if (specialsType === 'vegan') return text.includes('vegan');
              if (specialsType === 'vegetarian') return text.includes('vegetarian');
              return true;
            })
            .filter(i => {
              const q = query.trim().toLowerCase();
              if (!q) return true;
              const fields = [i.name, i.description, i.category, i.type, String(i.price)]
                .concat(Array.isArray(i.ingredients) ? i.ingredients : []);
              return fields.filter(Boolean).some(f => String(f).toLowerCase().includes(q));
            })
            .map((item, idx) => (
              <ItemCard key={item._id} item={item} onEdit={setEditing} onDelete={handleDelete} onOffer={handleOfferOpen} index={idx + 1} />
            ))}
        </ul>
      )}
      {!loading && selectedCategory !== 'Foods' && items
        .filter(item => (item.category || 'Foods') === selectedCategory)
        .filter(item => {
          const q = query.trim().toLowerCase();
          if (!q) return true;
          const fields = [item.name, item.description, item.category, item.type, String(item.price)]
            .concat(Array.isArray(item.ingredients) ? item.ingredients : []);
          return fields.filter(Boolean).some(f => String(f).toLowerCase().includes(q));
        })
        .length === 0 && <div>No menu items yet.</div>}
      {selectedCategory === 'Foods' && selectedType === 'Specials' && items
        .filter(i => (i.category || '') === 'Foods' && (i.type || '') === 'Specials')
        .filter(i => {
          const text = `${i.name || ''} ${i.description || ''}`.toLowerCase();
          if (specialsType === 'all') return true;
          if (specialsType === 'chef') return text.includes('chef');
          if (specialsType === 'day') return text.includes('day');
          if (specialsType === 'vegan') return text.includes('vegan');
          if (specialsType === 'vegetarian') return text.includes('vegetarian');
          return true;
        })
        .filter(i => {
          const q = query.trim().toLowerCase();
          if (!q) return true;
          const fields = [i.name, i.description, i.category, i.type, String(i.price)]
            .concat(Array.isArray(i.ingredients) ? i.ingredients : []);
          return fields.filter(Boolean).some(f => String(f).toLowerCase().includes(q));
        }).length === 0 && <div>No specials yet.</div>}
      {selectedCategory === 'Foods' && selectedType !== 'Specials' && items
        .filter(item => (item.category || 'Foods') === 'Foods')
        .filter(item => {
          const it = item.type || 'Breakfast';
          return it === selectedType;
        })
        .filter(item => {
          const q = query.trim().toLowerCase();
          if (!q) return true;
          const fields = [item.name, item.description, item.category, item.type, String(item.price)]
            .concat(Array.isArray(item.ingredients) ? item.ingredients : []);
          return fields.filter(Boolean).some(f => String(f).toLowerCase().includes(q));
        }).length === 0 && <div>No menu items yet.</div>}
    </div>
  );
}
