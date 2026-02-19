import React, { useEffect, useMemo, useState } from 'react';
import { HotelAPI, formatCurrency, formatDateTime } from '../api';

function getStatusOptions(order) {
  const isPickup = (order?.deliveryType || '').toLowerCase() === 'pickup';
  return isPickup
    ? ['pending', 'preparing', 'ready', 'completed']
    : ['pending', 'preparing', 'ready', 'on the way', 'delivered', 'cancelled'];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmOrder, setConfirmOrder] = useState(null);
  const [confirmMinutes, setConfirmMinutes] = useState('');
  const sections = ['Pending', 'In Progress', 'Delivered', 'Cancelled'];
  const [selectedSection, setSelectedSection] = useState('Pending');
  const [expandedId, setExpandedId] = useState(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await HotelAPI.listOrders();
      setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (e) {
      setError(e.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => {
    const sorted = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const pending = sorted.filter(o => o.status === 'pending');
    const inProgress = sorted.filter(o => ['preparing', 'ready', 'on the way'].includes(o.status));
    const delivered = sorted.filter(o => o.status === 'delivered' || o.status === 'completed');
    const cancelled = sorted.filter(o => o.status === 'cancelled');
    return { pending, inProgress, delivered, cancelled };
  }, [orders]);

  async function updateStatus(id, status) {
    try {
      let staffDisplayName = null;
      try { staffDisplayName = typeof localStorage !== 'undefined' ? localStorage.getItem('staffDisplayName') : null; } catch {}
      const payload = staffDisplayName ? { status, servedByName: staffDisplayName } : { status };
      await HotelAPI.updateOrder(id, payload);
      setOrders(prev => prev.map(o => (o._id === id ? { ...o, status } : o)));
    } catch (e) {
      alert(e.message || 'Failed to update status');
    }
  }

  function handleStatusChange(order, nextStatus) {
    if (order.status === 'pending') {
      alert('Please confirm the order first and set duration.');
      return;
    }
    if (nextStatus === 'delivered') {
      alert('Delivered is set automatically by the Delivery website.');
      return;
    }
    const requiresConfirm = ['ready', 'on the way'].includes(nextStatus) || nextStatus === 'cancelled';
    if (requiresConfirm) {
      if (!window.confirm(`Confirm change status to "${nextStatus}"?`)) return;
    }
    updateStatus(order._id, nextStatus);
  }

  async function handleConfirmSave() {
    if (!confirmOrder) return;
    const minutes = confirmMinutes === '' ? null : Number(confirmMinutes);
    try {
      let staffDisplayName = null;
      try { staffDisplayName = typeof localStorage !== 'undefined' ? localStorage.getItem('staffDisplayName') : null; } catch {}
      const payload = { status: 'preparing' };
      if (minutes != null && !Number.isNaN(minutes)) payload.etaMinutes = minutes;
      if (staffDisplayName) payload.servedByName = staffDisplayName;
      await HotelAPI.updateOrder(confirmOrder._id, payload);
      setOrders(prev => prev.map(o => (o._id === confirmOrder._id ? { ...o, status: 'preparing', etaMinutes: minutes ?? o.etaMinutes, servedByName: staffDisplayName || o.servedByName } : o)));
      setConfirmOrder(null);
      setConfirmMinutes('');
    } catch (e) {
      alert(e.message || 'Failed to confirm order');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0, color: '#1a2236' }}>Orders</h2>
        <span style={{ color: '#8a8fa3' }}>({orders.length})</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={load} style={{ padding: '6px 12px', borderRadius: 8, background: '#1a2236', color: '#fff', border: 'none' }}>Refresh</button>
        </div>
      </div>
      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      {/* Top Section Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {sections.map(sec => (
          <button key={sec} onClick={() => setSelectedSection(sec)}
                  style={{ padding: '8px 14px', borderRadius: 999, border: selectedSection === sec ? 'none' : '1px solid #dfe3ee', background: selectedSection === sec ? '#1a2236' : '#fff', color: selectedSection === sec ? '#fff' : '#1a2236', fontWeight: 600 }}>
            {sec}
          </button>
        ))}
      </div>

      {/* Section Content */}
      {selectedSection === 'Pending' && (
        <div style={{ marginTop: 12 }}>
          <h3 style={{ margin: '8px 0', color: '#1a2236' }}>Pending <span style={{ color: '#8a8fa3' }}>({grouped.pending.length})</span></h3>
          {grouped.pending.length === 0 && !loading && <div style={{ color: '#6a708a' }}>No pending orders.</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
            {grouped.pending.map(order => (
              <div key={order._id} style={{ border: '1px solid #eef0f6', borderRadius: 12, padding: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <strong>#{order._id?.slice(-6)}</strong>
                  <span style={{ color: '#8a8fa3' }}>• {formatDateTime(order.createdAt)}</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 700 }}>{formatCurrency(order.total || 0)}</span>
                </div>
                <div style={{ marginTop: 8, color: '#2a2f43' }}>
                  <div>{order.clientName || order.clientEmail || 'Client'} — {order.clientPhone || 'N/A'}</div>
                  {order.servedByName && <div style={{ color: '#2a2f43' }}>Served by: <strong>{order.servedByName}</strong></div>}
                  {order.clientEmail && <div style={{ color: '#6a708a' }}>{order.clientEmail}</div>}
                  {order.deliveryAddress && <div style={{ color: '#6a708a' }}>{order.deliveryAddress}</div>}
                  {/* Aggregated utilities/condiments/packaging/instructions summary */}
                  {(() => {
                    const items = Array.isArray(order.items) ? order.items : [];
                    const ut = Array.from(new Set(items.flatMap(it => Array.isArray(it.utensils) ? it.utensils : [])));
                    const cond = Array.from(new Set(items.flatMap(it => Array.isArray(it.condiments) ? it.condiments : [])));
                    const packaging = items
                      .filter(it => ((it.menuItem?.category || it.category) === 'Packaging'))
                      .map(it => it.menuItem?.name || it.name)
                      .filter(Boolean);
                    const notes = items.map(it => it.notes).filter(Boolean);
                    const dnotes = items.map(it => it.deliveryNotes).filter(Boolean);
                    return (
                      <>
                        {ut.length > 0 && (<div style={{ color: '#6a708a' }}>Utilities: {ut.join(', ')}</div>)}
                        {cond.length > 0 && (<div style={{ color: '#6a708a' }}>Condiments: {cond.join(', ')}</div>)}
                        {packaging.length > 0 && (<div style={{ color: '#6a708a' }}>Packaging: {packaging.join(', ')}</div>)}
                        {notes.length > 0 && (<div style={{ color: '#6a708a' }}>Notes: {notes.join(' | ')}</div>)}
                        {dnotes.length > 0 && (<div style={{ color: '#6a708a' }}>Delivery Instructions: {dnotes.join(' | ')}</div>)}
                      </>
                    );
                  })()}
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{ color: '#6a708a' }}>Status</label>
                  <select value={order.status} disabled style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e1e4ee' }}>
                    {getStatusOptions(order).map(s => (<option key={s} value={s}>{s}</option>))}
                  </select>
                  <button onClick={() => { setConfirmOrder(order); setConfirmMinutes(String(order.etaMinutes ?? '')); }}
                          style={{ padding: '6px 12px', borderRadius: 8, background: '#ffb300', color: '#1a2236', border: 'none' }}>
                    Confirm + Set Duration
                  </button>
                  <button onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e1e4ee', background: '#fff' }}>
                    {expandedId === order._id ? 'Hide Details' : 'View Details'}
                  </button>
                  <span style={{ marginLeft: 'auto', color: '#6a708a' }}>{order.items?.length || 0} items</span>
                </div>
                {expandedId === order._id && (
                  <div style={{ marginTop: 10, background: '#fafbfe', border: '1px solid #eef0f6', borderRadius: 10, padding: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8, color: '#1a2236' }}>Items</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {(order.items || []).map((it, i) => {
                        const name = it.menuItem?.name || it.name || 'Item';
                        const qty = it.quantity || it.qty || 1;
                        const price = it.menuItem?.price;
                        const total = price != null ? price * qty : (it.total != null ? it.total : null);
                        return (
                          <li key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 10, background: '#fff', borderRadius: 10, boxShadow: '0 1px 6px #0001', padding: '8px 12px' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, color: '#1a2236' }}>{name}</div>
                              <div style={{ color: '#555' }}>Qty: {qty}</div>
                              {total != null && <div style={{ fontWeight: 700, color: '#ffb300' }}>{formatCurrency(total)}</div>}
                              {it.utensils && it.utensils.length > 0 && (
                                <div style={{ color: '#6a708a', fontSize: 13 }}>Utensils: {it.utensils.join(', ')}</div>
                              )}
                              {it.condiments && it.condiments.length > 0 && (
                                <div style={{ color: '#6a708a', fontSize: 13 }}>Condiments: {it.condiments.join(', ')}</div>
                              )}
                              {it.notes && (
                                <div style={{ color: '#6a708a', fontSize: 13 }}>Notes: {it.notes}</div>
                              )}
                              {it.deliveryNotes && (
                                <div style={{ color: '#6a708a', fontSize: 13 }}>Delivery Instructions: {it.deliveryNotes}</div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <div style={{ display: 'flex', gap: 16, marginTop: 8, color: '#2a2f43', flexWrap: 'wrap' }}>
                      {order.paymentStatus && <div>Payment: <span style={{ color: '#ffb300', fontWeight: 600 }}>{order.paymentStatus}</span></div>}
                      {order.etaMinutes != null && <div>ETA: <span style={{ color: '#ffb300', fontWeight: 600 }}>{order.etaMinutes} min</span></div>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedSection === 'In Progress' && (
        <div style={{ marginTop: 12 }}>
          <h3 style={{ margin: '8px 0', color: '#1a2236' }}>In Progress <span style={{ color: '#8a8fa3' }}>({grouped.inProgress.length})</span></h3>
          {grouped.inProgress.length === 0 && !loading && <div style={{ color: '#6a708a' }}>No in-progress orders.</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
            {grouped.inProgress.map(order => (
              <div key={order._id} style={{ border: '1px solid #eef0f6', borderRadius: 12, padding: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <strong>#{order._id?.slice(-6)}</strong>
                  <span style={{ color: '#8a8fa3' }}>• {formatDateTime(order.createdAt)}</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 700 }}>{formatCurrency(order.total || 0)}</span>
                </div>
                <div style={{ marginTop: 8, color: '#2a2f43' }}>
                  <div>{order.clientName || order.clientEmail || 'Client'} — {order.clientPhone || 'N/A'}</div>
                  {order.servedByName && <div style={{ color: '#2a2f43' }}>Served by: <strong>{order.servedByName}</strong></div>}
                  {order.clientEmail && <div style={{ color: '#6a708a' }}>{order.clientEmail}</div>}
                  {order.deliveryAddress && <div style={{ color: '#6a708a' }}>{order.deliveryAddress}</div>}
                  {(() => {
                    const items = Array.isArray(order.items) ? order.items : [];
                    const ut = Array.from(new Set(items.flatMap(it => Array.isArray(it.utensils) ? it.utensils : [])));
                    const cond = Array.from(new Set(items.flatMap(it => Array.isArray(it.condiments) ? it.condiments : [])));
                    const packaging = items
                      .filter(it => ((it.menuItem?.category || it.category) === 'Packaging'))
                      .map(it => it.menuItem?.name || it.name)
                      .filter(Boolean);
                    const notes = items.map(it => it.notes).filter(Boolean);
                    const dnotes = items.map(it => it.deliveryNotes).filter(Boolean);
                    return (
                      <>
                        {ut.length > 0 && (<div style={{ color: '#6a708a' }}>Utilities: {ut.join(', ')}</div>)}
                        {cond.length > 0 && (<div style={{ color: '#6a708a' }}>Condiments: {cond.join(', ')}</div>)}
                        {packaging.length > 0 && (<div style={{ color: '#6a708a' }}>Packaging: {packaging.join(', ')}</div>)}
                        {notes.length > 0 && (<div style={{ color: '#6a708a' }}>Notes: {notes.join(' | ')}</div>)}
                        {dnotes.length > 0 && (<div style={{ color: '#6a708a' }}>Delivery Instructions: {dnotes.join(' | ')}</div>)}
                      </>
                    );
                  })()}
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{ color: '#6a708a' }}>Status</label>
                  <select
                    value={order.status}
                    onChange={e => handleStatusChange(order, e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e1e4ee' }}
                  >
                    {getStatusOptions(order).map(s => (
                      <option key={s} value={s} disabled={s === 'delivered'}>{s}</option>
                    ))}
                  </select>
                  <button onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e1e4ee', background: '#fff' }}>
                    {expandedId === order._id ? 'Hide Details' : 'View Details'}
                  </button>
                  <span style={{ marginLeft: 'auto', color: '#6a708a' }}>{order.items?.length || 0} items</span>
                </div>
                {expandedId === order._id && (
                  <div style={{ marginTop: 10, background: '#fafbfe', border: '1px solid #eef0f6', borderRadius: 10, padding: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8, color: '#1a2236' }}>Items</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {(order.items || []).map((it, i) => {
                        const name = it.menuItem?.name || it.name || 'Item';
                        const qty = it.quantity || it.qty || 1;
                        const price = it.menuItem?.price;
                        const total = price != null ? price * qty : (it.total != null ? it.total : null);
                        return (
                          <li key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 10, background: '#fff', borderRadius: 10, boxShadow: '0 1px 6px #0001', padding: '8px 12px' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, color: '#1a2236' }}>{name}</div>
                              <div style={{ color: '#555' }}>Qty: {qty}</div>
                              {total != null && <div style={{ fontWeight: 700, color: '#ffb300' }}>{formatCurrency(total)}</div>}
                              {it.utensils && it.utensils.length > 0 && (
                                <div style={{ color: '#6a708a', fontSize: 13 }}>Utensils: {it.utensils.join(', ')}</div>
                              )}
                              {it.condiments && it.condiments.length > 0 && (
                                <div style={{ color: '#6a708a', fontSize: 13 }}>Condiments: {it.condiments.join(', ')}</div>
                              )}
                              {it.notes && (
                                <div style={{ color: '#6a708a', fontSize: 13 }}>Notes: {it.notes}</div>
                              )}
                              {it.deliveryNotes && (
                                <div style={{ color: '#6a708a', fontSize: 13 }}>Delivery Instructions: {it.deliveryNotes}</div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <div style={{ display: 'flex', gap: 16, marginTop: 8, color: '#2a2f43', flexWrap: 'wrap' }}>
                      {order.paymentStatus && <div>Payment: <span style={{ color: '#ffb300', fontWeight: 600 }}>{order.paymentStatus}</span></div>}
                      {order.etaMinutes != null && <div>ETA: <span style={{ color: '#ffb300', fontWeight: 600 }}>{order.etaMinutes} min</span></div>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedSection === 'Delivered' && (
        <div style={{ marginTop: 12 }}>
          <h3 style={{ margin: '8px 0', color: '#1a2236' }}>Delivered <span style={{ color: '#8a8fa3' }}>({grouped.delivered.length})</span></h3>
          {grouped.delivered.length === 0 && !loading && <div style={{ color: '#6a708a' }}>No delivered orders.</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
            {grouped.delivered.map(order => (
              <div key={order._id} style={{ border: '1px solid #eef0f6', borderRadius: 12, padding: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <strong>#{order._id?.slice(-6)}</strong>
                  <span style={{ color: '#8a8fa3' }}>• {formatDateTime(order.createdAt)}</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 700 }}>{formatCurrency(order.total || 0)}</span>
                </div>
                <div style={{ marginTop: 8, color: '#2a2f43' }}>
                  <div>{order.clientName || order.clientEmail || 'Client'} — {order.clientPhone || 'N/A'}</div>
                  {order.servedByName && <div style={{ color: '#2a2f43' }}>Served by: <strong>{order.servedByName}</strong></div>}
                  {order.clientEmail && <div style={{ color: '#6a708a' }}>{order.clientEmail}</div>}
                  {order.deliveryAddress && <div style={{ color: '#6a708a' }}>{order.deliveryAddress}</div>}
                  {(() => {
                    const items = Array.isArray(order.items) ? order.items : [];
                    const ut = Array.from(new Set(items.flatMap(it => Array.isArray(it.utensils) ? it.utensils : [])));
                    const cond = Array.from(new Set(items.flatMap(it => Array.isArray(it.condiments) ? it.condiments : [])));
                    const packaging = items
                      .filter(it => ((it.menuItem?.category || it.category) === 'Packaging'))
                      .map(it => it.menuItem?.name || it.name)
                      .filter(Boolean);
                    const notes = items.map(it => it.notes).filter(Boolean);
                    const dnotes = items.map(it => it.deliveryNotes).filter(Boolean);
                    return (
                      <>
                        {ut.length > 0 && (<div style={{ color: '#6a708a' }}>Utilities: {ut.join(', ')}</div>)}
                        {cond.length > 0 && (<div style={{ color: '#6a708a' }}>Condiments: {cond.join(', ')}</div>)}
                        {packaging.length > 0 && (<div style={{ color: '#6a708a' }}>Packaging: {packaging.join(', ')}</div>)}
                        {notes.length > 0 && (<div style={{ color: '#6a708a' }}>Notes: {notes.join(' | ')}</div>)}
                        {dnotes.length > 0 && (<div style={{ color: '#6a708a' }}>Delivery Instructions: {dnotes.join(' | ')}</div>)}
                      </>
                    );
                  })()}
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{ color: '#6a708a' }}>Status</label>
                  <select value={order.status} disabled style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e1e4ee' }}>
                    {getStatusOptions(order).map(s => (<option key={s} value={s}>{s}</option>))}
                  </select>
                  <button onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e1e4ee', background: '#fff' }}>
                    {expandedId === order._id ? 'Hide Details' : 'View Details'}
                  </button>
                  <span style={{ marginLeft: 'auto', color: '#6a708a' }}>{order.items?.length || 0} items</span>
                </div>
                {expandedId === order._id && (
                  <div style={{ marginTop: 10, background: '#fafbfe', border: '1px solid #eef0f6', borderRadius: 10, padding: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8, color: '#1a2236' }}>Items</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {(order.items || []).map((it, i) => {
                        const name = it.menuItem?.name || it.name || 'Item';
                        const qty = it.quantity || it.qty || 1;
                        const price = it.menuItem?.price;
                        const total = price != null ? price * qty : (it.total != null ? it.total : null);
                        return (
                          <li key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 10, background: '#fff', borderRadius: 10, boxShadow: '0 1px 6px #0001', padding: '8px 12px' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, color: '#1a2236' }}>{name}</div>
                              <div style={{ color: '#555' }}>Qty: {qty}</div>
                              {total != null && <div style={{ fontWeight: 700, color: '#ffb300' }}>{formatCurrency(total)}</div>}
                              {it.utensils && it.utensils.length > 0 && (
                                <div style={{ color: '#6a708a', fontSize: 13 }}>Utensils: {it.utensils.join(', ')}</div>
                              )}
                              {it.condiments && it.condiments.length > 0 && (
                                <div style={{ color: '#6a708a', fontSize: 13 }}>Condiments: {it.condiments.join(', ')}</div>
                              )}
                              {it.notes && (
                                <div style={{ color: '#6a708a', fontSize: 13 }}>Notes: {it.notes}</div>
                              )}
                              {it.deliveryNotes && (
                                <div style={{ color: '#6a708a', fontSize: 13 }}>Delivery Instructions: {it.deliveryNotes}</div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <div style={{ display: 'flex', gap: 16, marginTop: 8, color: '#2a2f43', flexWrap: 'wrap' }}>
                      {order.paymentStatus && <div>Payment: <span style={{ color: '#ffb300', fontWeight: 600 }}>{order.paymentStatus}</span></div>}
                      {order.etaMinutes != null && <div>ETA: <span style={{ color: '#ffb300', fontWeight: 600 }}>{order.etaMinutes} min</span></div>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedSection === 'Cancelled' && (
        <div style={{ marginTop: 12 }}>
          <h3 style={{ margin: '8px 0', color: '#1a2236' }}>Cancelled <span style={{ color: '#8a8fa3' }}>({grouped.cancelled.length})</span></h3>
          {grouped.cancelled.length === 0 && !loading && <div style={{ color: '#6a708a' }}>No cancelled orders.</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
            {grouped.cancelled.map(order => (
              <div key={order._id} style={{ border: '1px solid #eef0f6', borderRadius: 12, padding: 12 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <strong>#{order._id?.slice(-6)}</strong>
                  <span style={{ color: '#8a8fa3' }}>• {formatDateTime(order.createdAt)}</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 700 }}>{formatCurrency(order.total || 0)}</span>
                </div>
                <div style={{ marginTop: 8, color: '#2a2f43' }}>
                  <div>{order.clientName || order.clientEmail || 'Client'} — {order.clientPhone || 'N/A'}</div>
                  {order.servedByName && <div style={{ color: '#2a2f43' }}>Served by: <strong>{order.servedByName}</strong></div>}
                  {order.clientEmail && <div style={{ color: '#6a708a' }}>{order.clientEmail}</div>}
                  {order.deliveryAddress && <div style={{ color: '#6a708a' }}>{order.deliveryAddress}</div>}
                  {(() => {
                    const items = Array.isArray(order.items) ? order.items : [];
                    const ut = Array.from(new Set(items.flatMap(it => Array.isArray(it.utensils) ? it.utensils : [])));
                    const cond = Array.from(new Set(items.flatMap(it => Array.isArray(it.condiments) ? it.condiments : [])));
                    const packaging = items
                      .filter(it => ((it.menuItem?.category || it.category) === 'Packaging'))
                      .map(it => it.menuItem?.name || it.name)
                      .filter(Boolean);
                    const notes = items.map(it => it.notes).filter(Boolean);
                    const dnotes = items.map(it => it.deliveryNotes).filter(Boolean);
                    return (
                      <>
                        {ut.length > 0 && (<div style={{ color: '#6a708a' }}>Utilities: {ut.join(', ')}</div>)}
                        {cond.length > 0 && (<div style={{ color: '#6a708a' }}>Condiments: {cond.join(', ')}</div>)}
                        {packaging.length > 0 && (<div style={{ color: '#6a708a' }}>Packaging: {packaging.join(', ')}</div>)}
                        {notes.length > 0 && (<div style={{ color: '#6a708a' }}>Notes: {notes.join(' | ')}</div>)}
                        {dnotes.length > 0 && (<div style={{ color: '#6a708a' }}>Delivery Instructions: {dnotes.join(' | ')}</div>)}
                      </>
                    );
                  })()}
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{ color: '#6a708a' }}>Status</label>
                  <select value={order.status} disabled style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e1e4ee' }}>
                    {getStatusOptions(order).map(s => (<option key={s} value={s}>{s}</option>))}
                  </select>
                  <button onClick={() => setExpandedId(expandedId === order._id ? null : order._id)}
                          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e1e4ee', background: '#fff' }}>
                    {expandedId === order._id ? 'Hide Details' : 'View Details'}
                  </button>
                  <span style={{ marginLeft: 'auto', color: '#6a708a' }}>{order.items?.length || 0} items</span>
                </div>
                {expandedId === order._id && (
                  <div style={{ marginTop: 10, background: '#fafbfe', border: '1px solid #eef0f6', borderRadius: 10, padding: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8, color: '#1a2236' }}>Items</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {(order.items || []).map((it, i) => {
                        const name = it.menuItem?.name || it.name || 'Item';
                        const qty = it.quantity || it.qty || 1;
                        const price = it.menuItem?.price;
                        const total = price != null ? price * qty : (it.total != null ? it.total : null);
                        return (
                          <li key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 10, background: '#fff', borderRadius: 10, boxShadow: '0 1px 6px #0001', padding: '8px 12px' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, color: '#1a2236' }}>{name}</div>
                              <div style={{ color: '#555' }}>Qty: {qty}</div>
                              {total != null && <div style={{ fontWeight: 700, color: '#ffb300' }}>{formatCurrency(total)}</div>}
                              {it.utensils && it.utensils.length > 0 && (
                                <div style={{ color: '#6a708a', fontSize: 13 }}>Utensils: {it.utensils.join(', ')}</div>
                              )}
                              {it.condiments && it.condiments.length > 0 && (
                                <div style={{ color: '#6a708a', fontSize: 13 }}>Condiments: {it.condiments.join(', ')}</div>
                              )}
                              {it.notes && (
                                <div style={{ color: '#6a708a', fontSize: 13 }}>Notes: {it.notes}</div>
                              )}
                              {it.deliveryNotes && (
                                <div style={{ color: '#6a708a', fontSize: 13 }}>Delivery Instructions: {it.deliveryNotes}</div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                    <div style={{ display: 'flex', gap: 16, marginTop: 8, color: '#2a2f43', flexWrap: 'wrap' }}>
                      {order.paymentStatus && <div>Payment: <span style={{ color: '#ffb300', fontWeight: 600 }}>{order.paymentStatus}</span></div>}
                      {order.etaMinutes != null && <div>ETA: <span style={{ color: '#ffb300', fontWeight: 600 }}>{order.etaMinutes} min</span></div>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {confirmOrder && (
        <div style={{ marginTop: 12, border: '1px solid #ffe6b3', background: '#fff8e6', borderRadius: 12, padding: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Confirm Order #{confirmOrder._id?.slice(-6)}</div>
          <div style={{ display: 'grid', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>Preparation Duration (minutes)</label>
              <input type="number" min="0" step="1" value={confirmMinutes}
                     onChange={e => setConfirmMinutes(e.target.value)}
                     style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e1e4ee' }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => { setConfirmOrder(null); setConfirmMinutes(''); }}
                      style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #dfe3ee', background: '#fff' }}>Cancel</button>
              <button onClick={handleConfirmSave}
                      style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#1a2236', color: '#fff' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
