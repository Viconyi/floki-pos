import React, { useEffect, useMemo, useState } from 'react';
import { HotelAPI, formatCurrency } from '../api';

function groupByDate(orders) {
  const out = {};
  for (const o of orders) {
    const d = new Date(o.createdAt);
    const key = d.toISOString().slice(0, 10);
    if (!out[key]) out[key] = { total: 0, count: 0 };
    out[key].total += Number(o.total || 0);
    out[key].count += 1;
  }
  return out;
}

export default function SalesPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [mode, setMode] = useState('all'); // 'all' | 'pickup' | 'delivery'
  const [expandedId, setExpandedId] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await HotelAPI.listOrders();
      setOrders(data);
    } catch (e) {
      setError(e.message || 'Failed to load sales');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const completed = useMemo(() => orders.filter(o => o.status === 'delivered' || o.status === 'completed'), [orders]);

  const filtered = useMemo(() => {
    let arr = completed;
    if (mode !== 'all') {
      const target = mode === 'pickup' ? 'pickup' : 'delivery';
      arr = arr.filter(o => String(o.deliveryType || 'pickup').toLowerCase() === target);
    }
    if (from) {
      const f = new Date(from);
      arr = arr.filter(o => new Date(o.createdAt) >= f);
    }
    if (to) {
      const t = new Date(to);
      t.setHours(23,59,59,999);
      arr = arr.filter(o => new Date(o.createdAt) <= t);
    }
    return arr;
  }, [completed, mode, from, to]);

  const totals = useMemo(() => {
    const revenue = filtered.reduce((s, o) => s + Number(o.total || 0), 0);
    const count = filtered.length;
    const avg = count ? revenue / count : 0;
    const byDate = groupByDate(filtered);
    const series = Object.entries(byDate).sort((a,b)=>a[0].localeCompare(b[0]));
    return { revenue, count, avg, series };
  }, [filtered]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <h2 style={{ margin: 0, color: '#1a2236' }}>Sales</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginLeft: 'auto' }}>
          <label style={{ color: '#6a708a', fontSize: 12 }}>From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e1e4ee' }} />
          <label style={{ color: '#6a708a', fontSize: 12 }}>To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e1e4ee' }} />
          <button onClick={load} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #dfe3ee', background: '#fff' }}>Refresh</button>
        </div>
      </div>
      {/* Segmentation tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {['all','pickup','delivery'].map(m => (
          <button key={m} onClick={() => setMode(m)}
                  style={{ padding: '8px 14px', borderRadius: 999, border: mode === m ? 'none' : '1px solid #dfe3ee', background: mode === m ? '#1a2236' : '#fff', color: mode === m ? '#fff' : '#1a2236', fontWeight: 600 }}>
            {m === 'all' ? 'All' : (m === 'pickup' ? 'Pickup' : 'Delivery')}
          </button>
        ))}
      </div>
      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
        <div style={{ border: '1px solid #eef0f6', borderRadius: 12, padding: 12 }}>
          <div style={{ color: '#6a708a', fontSize: 12 }}>Revenue</div>
          <div style={{ fontWeight: 800, fontSize: 22 }}>{formatCurrency(totals.revenue)}</div>
        </div>
        <div style={{ border: '1px solid #eef0f6', borderRadius: 12, padding: 12 }}>
          <div style={{ color: '#6a708a', fontSize: 12 }}>Orders</div>
          <div style={{ fontWeight: 800, fontSize: 22 }}>{totals.count}</div>
        </div>
        <div style={{ border: '1px solid #eef0f6', borderRadius: 12, padding: 12 }}>
          <div style={{ color: '#6a708a', fontSize: 12 }}>Avg. Order</div>
          <div style={{ fontWeight: 800, fontSize: 22 }}>{formatCurrency(totals.avg)}</div>
        </div>
      </div>

      <div style={{ border: '1px solid #eef0f6', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#fafbfe', color: '#6a708a', padding: '8px 12px', fontSize: 12 }}>
          <div>Date</div>
          <div>Revenue</div>
        </div>
        {totals.series.map(([date, d]) => (
          <div key={date} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '8px 12px', borderTop: '1px solid #f0f2f7' }}>
            <div>{date}</div>
            <div style={{ fontWeight: 600 }}>{formatCurrency(d.total)}</div>
          </div>
        ))}
        {!loading && totals.series.length === 0 && (
          <div style={{ padding: 12, color: '#6a708a' }}>No sales in this range.</div>
        )}
      </div>

      {/* Recent orders with expandable details */}
      <div style={{ marginTop: 16, border: '1px solid #eef0f6', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', background: '#fafbfe', color: '#6a708a', padding: '8px 12px', fontSize: 12 }}>
          <div>Order</div>
          <div>Amount</div>
          <div>Type</div>
          <div>Served By</div>
        </div>
        {filtered.slice(0, 30).map(o => {
          const isExpanded = expandedId === String(o._id);
          const type = o.saleType ? String(o.saleType) : String(o.deliveryType || 'Pickup');
          return (
            <div key={o._id} style={{ borderTop: '1px solid #f0f2f7' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '8px 12px', cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : String(o._id))}>
                <div>#{String(o._id).slice(-6)} • {new Date(o.createdAt).toLocaleString()}</div>
                <div style={{ fontWeight: 600 }}>{formatCurrency(Number(o.total || 0))}</div>
                <div style={{ fontWeight: 600 }}>{type}</div>
                <div style={{ fontWeight: 600 }}>{o.servedByName || '—'}</div>
              </div>
              {isExpanded && (
                <div style={{ background: '#fafbfe', padding: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, color: '#1a2236' }}>Items</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {(o.items || []).map((it, i) => {
                      const name = it.menuItem?.name || it.name || 'Item';
                      const qty = it.quantity || it.qty || 1;
                      const price = it.menuItem?.price;
                      const total = price != null ? price * qty : null;
                      return (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600 }}>{name}</div>
                            <div style={{ color: '#6a708a', fontSize: 13 }}>Qty: {qty}</div>
                            {total != null && <div style={{ color: '#ffb300', fontWeight: 700 }}>{formatCurrency(total)}</div>}
                            {it.utensils && it.utensils.length > 0 && (
                              <div style={{ color: '#6a708a', fontSize: 13 }}>Utensils: {it.utensils.join(', ')}</div>
                            )}
                            {it.condiments && it.condiments.length > 0 && (
                              <div style={{ color: '#6a708a', fontSize: 13 }}>Condiments: {it.condiments.join(', ')}</div>
                            )}
                            {it.notes && (
                              <div style={{ color: '#6a708a', fontSize: 13 }}>Notes: {it.notes}</div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8, color: '#2a2f43', flexWrap: 'wrap' }}>
                    {o.paymentStatus && <div>Payment: <span style={{ color: '#ffb300', fontWeight: 600 }}>{o.paymentStatus}</span></div>}
                    {o.clientName && <div>Client: <span style={{ fontWeight: 600 }}>{o.clientName}</span></div>}
                    {o.clientPhone && <div>Phone: <span style={{ fontWeight: 600 }}>{o.clientPhone}</span></div>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: 12, color: '#6a708a' }}>No recent orders.</div>
        )}
      </div>
    </div>
  );
}
