import React, { useEffect, useState } from 'react';
import { AdminAPI, setApiErrorHandler, formatDateTime, formatCurrency } from './api';

// Seeding helper removed per request

function App() {
  // Hard lock simple credential gate
  const ADMIN_USER = 'DrOnyino';
  const ADMIN_PASS = 'Aggrey2027!';
  const [authed, setAuthed] = useState(false);
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [authErr, setAuthErr] = useState('');
  useEffect(() => {
    try {
      const ok = typeof localStorage !== 'undefined' && localStorage.getItem('adminAuthOK') === 'true';
      if (ok) setAuthed(true);
    } catch {}
  }, []);
  function handleLogin(e) {
    e.preventDefault();
    if (u === ADMIN_USER && p === ADMIN_PASS) {
      setAuthed(true);
      setAuthErr('');
      try { if (typeof localStorage !== 'undefined') localStorage.setItem('adminAuthOK', 'true'); } catch {}
    } else {
      setAuthErr('Invalid credentials');
    }
  }
  const [apiDown, setApiDown] = useState(false);
  const [tab, setTab] = useState('staff'); // 'staff' | 'orders' | 'accounting'

  useEffect(() => {
    setApiErrorHandler((err, info) => {
      const status = info && typeof info.status === 'number' ? info.status : null;
      setApiDown(!!err && (status == null || status >= 500));
    });
  }, []);
  // Seeding defaults removed per request
  if (!authed) {
    return (
      <div style={{ fontFamily: 'Inter, Arial, sans-serif', background: '#f7f7fa', minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <form onSubmit={handleLogin} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #0001', padding: '2rem', width: '92vw', maxWidth: 420 }}>
          <img src={process.env.PUBLIC_URL + '/FoodLoki.png'} alt="FoodLoki Logo" style={{ width: 80, margin: '0 auto 18px', display: 'block' }} />
          <h2 style={{ marginTop: 0, color: '#1a2236' }}>Admin Sign In</h2>
          {authErr && <div style={{ color: 'crimson', marginBottom: 8 }}>{authErr}</div>}
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>Username</label>
            <input value={u} onChange={e => setU(e.target.value)} autoFocus style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e1e4ee' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>Password</label>
            <input type="password" value={p} onChange={e => setP(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e1e4ee' }} />
          </div>
          <button type="submit" style={{ padding: '10px 14px', borderRadius: 8, border: 'none', background: '#1a2236', color: '#fff', fontWeight: 700, width: '100%' }}>Sign In</button>
        </form>
      </div>
    );
  }
  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif', background: '#f7f7fa', minHeight: '100vh' }}>
      <header style={{ background: '#1a2236', color: '#fff', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, fontSize: 28 }}>FoodLoki - Admin</span>
        <nav style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setTab('staff')} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: tab === 'staff' ? '#ffb300' : '#2d3a58', color: '#fff', fontWeight: 700 }}>Staff</button>
          <button onClick={() => setTab('orders')} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: tab === 'orders' ? '#ffb300' : '#2d3a58', color: '#fff', fontWeight: 700 }}>Orders</button>
          <button onClick={() => setTab('accounting')} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: tab === 'accounting' ? '#ffb300' : '#2d3a58', color: '#fff', fontWeight: 700 }}>Accounting</button>
        </nav>
      </header>
      {apiDown && (
        <div style={{ background: '#fff4e5', color: '#8a5a00', borderBottom: '1px solid #ffd8a8', padding: '8px 12px', textAlign: 'center', fontSize: 14 }}>
          Backend unreachable. Please ensure the server is running on port 5000.
        </div>
      )}
      <main style={{ maxWidth: 900, margin: '2rem auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #0001', padding: '2rem' }}>
        {tab === 'staff' && (
          <StaffPanel />
        )}
        {tab === 'orders' && (
          <OrdersPanel />
        )}
        {tab === 'accounting' && (
          <AccountingPanel />
        )}
        {/* Seeding UI removed */}
      </main>
      <footer style={{ textAlign: 'center', color: '#888', padding: 24, fontSize: 15 }}>
        &copy; {new Date().getFullYear()} FoodLoki. All rights reserved.<br />
        Contact: <a href="tel:+254759424562" style={{ color: '#888' }}>+254759424562</a>
      </footer>
    </div>
  );
}

export default App;

function StaffPanel() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', firstName: '', lastName: '', role: 'staff', pin: '' });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await AdminAPI.listStaff();
      setList(data);
    } catch (e) {
      setError(e.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function update(k, v) { setForm(prev => ({ ...prev, [k]: v })); }

  async function createStaff(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const created = await AdminAPI.createStaff(form);
      setList(prev => [created, ...prev]);
      setForm({ username: '', firstName: '', lastName: '', role: 'staff', pin: '' });
    } catch (e) {
      setError(e.message || 'Failed to create staff');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(item) {
    const updated = await AdminAPI.updateStaff(item._id, { active: !item.active });
    setList(prev => prev.map(s => s._id === updated._id ? updated : s));
  }

  async function resetPin(item) {
    const pin = window.prompt(`Enter new PIN/password for ${item.username}`);
    if (!pin) return;
    const updated = await AdminAPI.updateStaff(item._id, { pin });
    setList(prev => prev.map(s => s._id === updated._id ? updated : s));
  }

  async function deleteStaff(item) {
    if (!window.confirm(`Delete ${item.username}?`)) return;
    await AdminAPI.deleteStaff(item._id);
    setList(prev => prev.filter(s => s._id !== item._id));
  }

  return (
    <div>
      <h2 style={{ color: '#1a2236' }}>Staff Management</h2>
      {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
      <form onSubmit={createStaff} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>Username</label>
          <input value={form.username} onChange={e => update('username', e.target.value)} required style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8, border: '1px solid #e1e4ee' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>First Name</label>
          <input value={form.firstName} onChange={e => update('firstName', e.target.value)} required style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8, border: '1px solid #e1e4ee' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>Last Name</label>
          <input value={form.lastName} onChange={e => update('lastName', e.target.value)} required style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8, border: '1px solid #e1e4ee' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>Role</label>
          <select value={form.role} onChange={e => update('role', e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8, border: '1px solid #e1e4ee' }}>
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>PIN / Password</label>
          <input type="password" value={form.pin} onChange={e => update('pin', e.target.value)} required style={{ width: '100%', boxSizing: 'border-box', padding: 10, borderRadius: 8, border: '1px solid #e1e4ee' }} />
        </div>
        <div style={{ alignSelf: 'end' }}>
          <button type="submit" disabled={submitting} style={{ padding: '10px 14px', borderRadius: 8, border: 'none', background: '#1a2236', color: '#fff', fontWeight: 700 }}>
            {submitting ? 'Creating…' : 'Create Staff'}
          </button>
        </div>
      </form>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
              <th>Username</th>
              <th>Name</th>
              <th>Role</th>
              <th>Active</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map(item => (
              <tr key={item._id} style={{ borderBottom: '1px solid #f3f4f8' }}>
                <td>{item.username}</td>
                <td>{(item.firstName || item.lastName) ? `${item.firstName || ''}${item.lastName ? ' ' + item.lastName : ''}` : (item.name || '-')}</td>
                <td>{item.role || 'staff'}</td>
                <td>
                  <span style={{ padding: '2px 8px', borderRadius: 999, background: item.active ? '#ddf6e5' : '#ffe9e6', color: item.active ? '#1c7d42' : '#b23b2e', fontSize: 12 }}>
                    {item.active ? 'Yes' : 'No'}
                  </span>
                </td>
                <td>{formatDateTime(item.createdAt)}</td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => toggleActive(item)} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: '#2d3a58', color: '#fff' }}>{item.active ? 'Deactivate' : 'Activate'}</button>
                  <button onClick={() => resetPin(item)} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: '#ffb300', color: '#1a2236' }}>Reset PIN</button>
                  <button onClick={() => deleteStaff(item)} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: '#b23b2e', color: '#fff' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// TillPanel removed as per request (Admin only needs Staff, Orders, Accounting)

function OrdersPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await AdminAPI.listOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  // Group orders by day (YYYY-MM-DD) and count
  const dayCounts = React.useMemo(() => {
    const map = new Map();
    orders.forEach(o => {
      const d = new Date(o.createdAt);
      if (isNaN(d)) return;
      const iso = d.toISOString().slice(0, 10);
      const display = d.toLocaleDateString();
      const prev = map.get(iso);
      if (prev) prev.count += 1; else map.set(iso, { iso, display, count: 1 });
    });
    return Array.from(map.values()).sort((a, b) => (a.iso < b.iso ? 1 : -1));
  }, [orders]);

  const totalOrders = orders.length;

  return (
    <div>
      <h2 style={{ color: '#1a2236' }}>Orders</h2>
      {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
        <div style={{ background: '#f7f7fa', borderRadius: 10, padding: 12 }}>
          <div style={{ color: '#6a708a', fontSize: 12 }}>Total Orders</div>
          <div style={{ fontWeight: 800, fontSize: 22 }}>{totalOrders}</div>
        </div>
        <button onClick={load} style={{ marginLeft: 'auto', padding: '8px 12px', borderRadius: 8, border: '1px solid #dfe3ee', background: '#fff' }}>Refresh</button>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
              <th>Date</th>
              <th>Order Count</th>
            </tr>
          </thead>
          <tbody>
            {dayCounts.map(({ iso, display, count }) => (
              <tr key={iso} style={{ borderBottom: '1px solid #f3f4f8' }}>
                <td>{display}</td>
                <td style={{ fontWeight: 700 }}>{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function AccountingPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await AdminAPI.listOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function totalFor(order) {
    if (typeof order.total === 'number') return order.total;
    const items = Array.isArray(order.items) ? order.items : [];
    return items.reduce((sum, it) => sum + Number((it.quantity || 1) * (it.menuItem && it.menuItem.price ? it.menuItem.price : 0)), 0);
  }

  function isCompleted(o) {
    const t = String(o.status || '').toLowerCase();
    return t.includes('completed') || t.includes('delivered');
  }

  const completed = orders.filter(isCompleted);
  const revenue = completed.reduce((s, o) => s + totalFor(o), 0);
  const avgOrder = completed.length ? revenue / completed.length : 0;

  const todayStr = new Date().toDateString();
  const todayRev = completed
    .filter(o => new Date(o.createdAt).toDateString() === todayStr)
    .reduce((s, o) => s + totalFor(o), 0);

  // Bulk ETR generation state
  const [bulkEtrLoading, setBulkEtrLoading] = useState(false);
  const [bulkEtrError, setBulkEtrError] = useState('');
  const [bulkEtrResult, setBulkEtrResult] = useState(null);

  async function handleBulkEtr() {
    setBulkEtrLoading(true); setBulkEtrError(''); setBulkEtrResult(null);
    try {
      const ids = completed.map(o => o._id);
      if (!ids.length) throw new Error('No completed orders');
      const etrs = await AdminAPI.generateBulkETR(ids);
      setBulkEtrResult(etrs);
      // Optionally, open all ETRs in new tabs
      etrs.forEach(e => {
        const w = window.open();
        if (w) { w.document.write(e.etr); w.document.close(); }
      });
    } catch (e) {
      setBulkEtrError(e.message || 'Failed to generate bulk ETR');
    } finally {
      setBulkEtrLoading(false);
    }
  }

  return (
    <div>
      <h2 style={{ color: '#1a2236' }}>Accounting</h2>
      {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div style={{ background: '#f7f7fa', borderRadius: 10, padding: 12 }}>
          <div style={{ color: '#6a708a', fontSize: 12 }}>Revenue</div>
          <div style={{ fontWeight: 800, fontSize: 24 }}>{formatCurrency(revenue)}</div>
        </div>
        <div style={{ background: '#f7f7fa', borderRadius: 10, padding: 12 }}>
          <div style={{ color: '#6a708a', fontSize: 12 }}>Completed Orders</div>
          <div style={{ fontWeight: 800, fontSize: 24 }}>{completed.length}</div>
        </div>
        <div style={{ background: '#f7f7fa', borderRadius: 10, padding: 12 }}>
          <div style={{ color: '#6a708a', fontSize: 12 }}>Average Order</div>
          <div style={{ fontWeight: 800, fontSize: 24 }}>{formatCurrency(avgOrder)}</div>
        </div>
        <div style={{ background: '#f7f7fa', borderRadius: 10, padding: 12 }}>
          <div style={{ color: '#6a708a', fontSize: 12 }}>Today</div>
          <div style={{ fontWeight: 800, fontSize: 24 }}>{formatCurrency(todayRev)}</div>
        </div>
      </div>

      <button onClick={handleBulkEtr} disabled={bulkEtrLoading || loading} style={{ marginBottom: 16, padding: '10px 18px', borderRadius: 8, border: 'none', background: '#1a2236', color: '#fff', fontWeight: 700 }}>
        {bulkEtrLoading ? 'Generating ETRs…' : 'Generate Bulk ETRs for Completed Orders'}
      </button>
      {bulkEtrError && <div style={{ color: 'crimson', marginBottom: 8 }}>{bulkEtrError}</div>}
      {bulkEtrResult && <div style={{ color: '#1a2236', marginBottom: 8 }}>{bulkEtrResult.length} ETRs generated and opened in new tabs.</div>}

      {loading ? <div>Loading…</div> : (
        <div style={{ color: '#6a708a', fontSize: 13 }}>Data derived from completed orders.</div>
      )}
    </div>
  );
}
