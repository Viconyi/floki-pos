import React from 'react';
import { io } from 'socket.io-client';

function Track({ trackOrders, setTrackOrders, config }) {
  const [view, setView] = React.useState('current');
  const [expanded, setExpanded] = React.useState(null); // orderId
  const [ratingOrderIndex, setRatingOrderIndex] = React.useState(null);
  const [itemRatings, setItemRatings] = React.useState({}); // key: item idx -> {stars, comment}
  const [deliveryRating, setDeliveryRating] = React.useState({ stars: 0, comment: '' });
  const socketRef = React.useRef(null);
  React.useEffect(() => {
    const apiBase = process.env.REACT_APP_API_BASE || window.location.origin;
    const socket = io(apiBase);
    socketRef.current = socket;
    socket.on('orderStatusUpdate', (data) => {
      setTrackOrders(prev => prev.map(o => o.id === data.orderId ? { ...o, status: data.status, etaMinutes: data.etaMinutes ?? o.etaMinutes, driver: data.driver || o.driver, servedByName: data.servedByName || o.servedByName } : o));
      try {
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('Order Update', { body: `Order status: ${data.status}` });
        }
      } catch {}
    });
    socket.on('locationUpdate', (data) => {
      // Optional: update current order location if ids match
      if (data.orderId) {
        setTrackOrders(prev => prev.map(o => o.id === data.orderId ? { ...o, location: data.location } : o));
      }
    });
    return () => { socket.disconnect(); };
  }, [setTrackOrders]);

  // Auto-open rating modal when an order reaches final status (Completed/Delivered) and hasn't been prompted/rated.
  React.useEffect(() => {
    if (ratingOrderIndex != null) return;
    const idx = trackOrders.findIndex(o => (o && ['Completed', 'Delivered'].includes(o.status)) && !o.ratingPrompted && !o.rated);
    if (idx !== -1) {
      setRatingOrderIndex(idx);
      setTrackOrders(prev => prev.map((o, i) => i === idx ? { ...o, ratingPrompted: true } : o));
    }
  }, [trackOrders, ratingOrderIndex, setTrackOrders]);
  const currentOrders = trackOrders.filter(order => !['Completed','Delivered'].includes(order.status));
  const pastOrders = trackOrders.filter(order => ['Completed','Delivered'].includes(order.status));

  function etaDisplay(order) {
    if (!order.etaMinutes || !order.date) return '—';
    const etaMs = new Date(order.date).getTime() + order.etaMinutes * 60 * 1000;
    const remainingMs = etaMs - Date.now();
    if (remainingMs <= 0) return 'Arriving now';
    const mins = Math.ceil(remainingMs / 60000);
    return `${mins} min`;
  }

  function progressPercent(order) {
    const isPickup = (order.deliveryType || '').toLowerCase() === 'pickup';
    if (isPickup) {
      const map = { Pending: 10, Preparing: 50, Ready: 90, Completed: 100 };
      return map[order.status] ?? 10;
    }
    const map = { Pending: 10, Preparing: 40, 'On the Way': 75, Delivered: 100 };
    return map[order.status] ?? 10;
  }
  const availableUtensils = Array.isArray(config?.utensils) ? config.utensils : [];
  const availableCondiments = Array.isArray(config?.condiments) ? config.condiments : [];
  const utensilPrices = { Spoon: 20, Plate: 50, Cup: 20 };
  async function confirmOrder(oi) {
    const order = trackOrders[oi];
    try {
      if (order.id) {
        const res = await fetch(`/api/hotel/orders/${order.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'completed' }),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || 'Failed to confirm');
      }
    } catch {}
    setTrackOrders(prev => prev.map((o, idx) => idx === oi ? { ...o, status: 'Completed' } : o));
  }
  function addItemUtensil(orderIndex, itemIndex, ut) {
    if (!ut) return;
    setTrackOrders(prev => prev.map((o, oi) => {
      if (oi !== orderIndex) return o;
      const items = o.items.map((it, ii) => {
        if (ii !== itemIndex) return it;
        if (it.utensils && it.utensils.includes(ut)) return it;
        const newUtensils = [...(it.utensils || []), ut];
        const newTotal = (it.total || 0) + (utensilPrices[ut] || 0);
        return { ...it, utensils: newUtensils, total: newTotal };
      });
      const newOrderTotal = (o.total || 0) + (utensilPrices[ut] || 0);
      return { ...o, items, total: newOrderTotal };
    }));
  }
  function addItemCondiment(orderIndex, itemIndex, cond) {
    if (!cond) return;
    setTrackOrders(prev => prev.map((o, oi) => {
      if (oi !== orderIndex) return o;
      const items = o.items.map((it, ii) => {
        if (ii !== itemIndex) return it;
        if (it.condiments && it.condiments.includes(cond)) return it;
        const newConds = [...(it.condiments || []), cond];
        return { ...it, condiments: newConds };
      });
      return { ...o, items };
    }));
  }
  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', background: '#fff', borderRadius: 24, boxShadow: '0 4px 32px #0002', padding: '2.5rem', minHeight: 300 }}>
      <h2 style={{ color: '#1a2236', fontWeight: 700, fontSize: 32, marginBottom: 24, textAlign: 'center', letterSpacing: 1 }}>Your Orders</h2>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <div style={{ background: '#f7f7fa', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: '6px 8px', display: 'flex', gap: 0 }}>
          <button
            style={{
              background: view === 'current' ? '#ffb300' : 'transparent',
              color: view === 'current' ? '#222' : '#888',
              border: 'none',
              borderRadius: '12px 0 0 12px',
              padding: '12px 32px',
              fontWeight: 700,
              fontSize: 18,
              cursor: 'pointer',
              boxShadow: view === 'current' ? '0 2px 8px #ffb30033' : 'none',
              transition: 'background 0.2s',
            }}
            onClick={() => setView('current')}
          >Current Orders</button>
          <button
            style={{
              background: view === 'past' ? '#ffb300' : 'transparent',
              color: view === 'past' ? '#222' : '#888',
              border: 'none',
              borderRadius: '0 12px 12px 0',
              padding: '12px 32px',
              fontWeight: 700,
              fontSize: 18,
              cursor: 'pointer',
              boxShadow: view === 'past' ? '0 2px 8px #ffb30033' : 'none',
              transition: 'background 0.2s',
            }}
            onClick={() => setView('past')}
          >Past Orders</button>
        </div>
      </div>
      {view === 'current' ? (
        currentOrders.length > 0 ? (
          <div style={{ width: '100%' }}>
            {currentOrders.map((order, idx) => (
              <div key={order.id || idx} style={{ marginBottom: 36, padding: '24px 18px', borderRadius: 18, background: '#f7f7fa', boxShadow: '0 2px 12px #0001', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <button onClick={() => setExpanded(expanded === (order.id || idx) ? null : (order.id || idx))} style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}>
                    <div style={{ fontWeight: 700, fontSize: 22, color: '#1a2236' }}>Order #{idx + 1}</div>
                  </button>
                  <div style={{ color: '#888', fontSize: 16 }}>{order.date ? new Date(order.date).toLocaleString() : ''}</div>
                </div>
                <div style={{ fontWeight: 600, fontSize: 18, color: '#ffb300', marginBottom: 8 }}>Status: {order.status}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ flex: 1, height: 10, background: '#e0e0e0', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ width: progressPercent(order) + '%', height: '100%', background: '#ffb300' }} />
                  </div>
                  <div style={{ color: '#1a2236', fontWeight: 600 }}>ETA: <span style={{ color: '#ffb300' }}>{etaDisplay(order)}</span></div>
                </div>
                {order.status === 'Delivery' && (
                  <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 12, padding: '10px 12px', marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, color: '#1a2236', marginBottom: 6 }}>Courier</div>
                    <div style={{ color: '#555' }}>Name: <span style={{ color: '#1a2236', fontWeight: 600 }}>{order.driver?.name || 'Assigned courier'}</span></div>
                    <div style={{ color: '#555' }}>Contact: <span style={{ color: '#1a2236', fontWeight: 600 }}>{order.driver?.phone || '—'}</span></div>
                  </div>
                )}
                <div style={{ fontWeight: 600, fontSize: 16, color: '#1a2236', marginBottom: 8 }}>Payment: <span style={{ color: '#ffb300' }}>{order.paymentMethod}</span></div>
                {order.servedByName && (
                  <div style={{ fontWeight: 600, fontSize: 16, color: '#1a2236', marginBottom: 8 }}>Served by: <span style={{ color: '#ffb300' }}>{order.servedByName}</span></div>
                )}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 18, color: '#1a2236', marginBottom: 6 }}>Items</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {order.items.map((item, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 10, background: '#fff', borderRadius: 10, boxShadow: '0 1px 6px #0001', padding: '8px 12px' }}>
                        <img src={item.img || 'https://via.placeholder.com/40?text=No+Image'} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 10, marginRight: 16 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 18, color: '#1a2236' }}>{item.name}</div>
                          <div style={{ color: '#555', fontSize: 15 }}>Qty: {item.qty}</div>
                          <div style={{ fontWeight: 700, color: '#ffb300', fontSize: 16, marginTop: 2 }}>{item.total} Ksh</div>
                          {item.utensils && item.utensils.length > 0 && (
                            <div style={{ color: '#888', fontSize: 14 }}>Utensils: {item.utensils.join(', ')}</div>
                          )}
                          {item.condiments && item.condiments.length > 0 && (
                            <div style={{ color: '#888', fontSize: 14 }}>Condiments: {item.condiments.join(', ')}</div>
                          )}
                          {item.notes && (
                            <div style={{ color: '#888', fontSize: 14 }}>Notes: {item.notes}</div>
                          )}
                          {item.deliveryNotes && (
                            <div style={{ color: '#888', fontSize: 14 }}>Delivery Instructions: {item.deliveryNotes}</div>
                          )}
                          <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                            {availableUtensils.length > 0 && (
                              <select onChange={e => { const v = e.target.value; e.target.selectedIndex = 0; addItemUtensil(idx, i, v); }} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #eee' }}>
                                <option value="">Add Utility</option>
                                {availableUtensils.map(ut => (
                                  <option key={ut} value={ut}>{ut} {utensilPrices[ut] ? `(+${utensilPrices[ut]} Ksh)` : ''}</option>
                                ))}
                              </select>
                            )}
                            {availableCondiments.length > 0 && (
                              <select onChange={e => { const v = e.target.value; e.target.selectedIndex = 0; addItemCondiment(idx, i, v); }} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #eee' }}>
                                <option value="">Add Condiment</option>
                                {availableCondiments.map(cond => (
                                  <option key={cond} value={cond}>{cond}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                {expanded === (order.id || idx) && (
                  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #eee', padding: '12px 14px', marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, color: '#1a2236', marginBottom: 8 }}>Progress</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {(((order.deliveryType || '').toLowerCase() === 'pickup')
                        ? ['Pending','Preparing','Ready','Completed']
                        : ['Pending','Preparing','On the Way','Delivered']
                      ).map(step => (
                        <li key={step} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span style={{ width: 10, height: 10, borderRadius: 5, background: step === order.status ? '#ffb300' : '#e0e0e0' }} />
                          <span style={{ color: step === order.status ? '#1a2236' : '#888', fontWeight: step === order.status ? 700 : 500 }}>{step}</span>
                        </li>
                      ))}
                    </ul>
                    {((order.deliveryType || '').toLowerCase() === 'pickup' && order.status === 'Ready') ? (
                      <button onClick={() => confirmOrder(idx)} style={{ background: '#1a2236', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
                        Confirm Received
                      </button>
                    ) : null}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 32, marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, color: '#1a2236', fontSize: 17 }}>Delivery Type: <span style={{ color: '#ffb300' }}>{order.deliveryType}</span></div>
                  <div style={{ fontWeight: 600, color: '#1a2236', fontSize: 17 }}>Total: <span style={{ color: '#ffb300' }}>{order.total} Ksh</span></div>
                </div>
                {order.canCancel && (
                  <button style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, fontSize: 17, cursor: 'pointer', marginBottom: 12 }}
                    onClick={() => {
                      setTrackOrders(prev => prev.filter((_, i) => i !== idx));
                    }}
                  >Cancel Order</button>
                )}
                <div style={{ color: '#888', fontSize: 15, marginBottom: 4 }}>
                  <em>Thank you for your order! We'll keep you updated on its progress.</em>
                </div>
                {['Completed','Delivered'].includes(order.status) && (
                  <button onClick={() => { setRatingOrderIndex(idx); setItemRatings({}); setDeliveryRating({ stars: 0, comment: '' }); }}
                          style={{ background: '#ffb300', color: '#222', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, fontSize: 17, cursor: 'pointer' }}>
                    Rate Order
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#888', fontSize: 22, fontWeight: 600, textAlign: 'center', marginTop: 60 }}>
            No current orders.
          </div>
        )
      ) : (
        pastOrders.length > 0 ? (
          <div style={{ width: '100%' }}>
            {pastOrders.map((order, idx) => (
              <div key={idx} style={{ marginBottom: 36, padding: '24px 18px', borderRadius: 18, background: '#f7f7fa', boxShadow: '0 2px 12px #0001', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 22, color: '#1a2236' }}>Order #{idx + 1}</div>
                  <div style={{ color: '#888', fontSize: 16 }}>{order.date ? new Date(order.date).toLocaleString() : ''}</div>
                </div>
                <div style={{ fontWeight: 600, fontSize: 18, color: '#ffb300', marginBottom: 8 }}>Status: {order.status}</div>
                <div style={{ fontWeight: 600, fontSize: 16, color: '#1a2236', marginBottom: 8 }}>Payment: <span style={{ color: '#ffb300' }}>{order.paymentMethod}</span></div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 18, color: '#1a2236', marginBottom: 6 }}>Items</div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {order.items.map((item, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 10, background: '#fff', borderRadius: 10, boxShadow: '0 1px 6px #0001', padding: '8px 12px' }}>
                        <img src={item.img || 'https://via.placeholder.com/40?text=No+Image'} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 10, marginRight: 16 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 18, color: '#1a2236' }}>{item.name}</div>
                          <div style={{ color: '#555', fontSize: 15 }}>Qty: {item.qty}</div>
                          <div style={{ fontWeight: 700, color: '#ffb300', fontSize: 16, marginTop: 2 }}>{item.total} Ksh</div>
                          {item.utensils && item.utensils.length > 0 && (
                            <div style={{ color: '#888', fontSize: 14 }}>Utensils: {item.utensils.join(', ')}</div>
                          )}
                          {item.condiments && item.condiments.length > 0 && (
                            <div style={{ color: '#888', fontSize: 14 }}>Condiments: {item.condiments.join(', ')}</div>
                          )}
                          {item.notes && (
                            <div style={{ color: '#888', fontSize: 14 }}>Notes: {item.notes}</div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ display: 'flex', gap: 32, marginBottom: 12 }}>
                  <div style={{ fontWeight: 600, color: '#1a2236', fontSize: 17 }}>Delivery Type: <span style={{ color: '#ffb300' }}>{order.deliveryType}</span></div>
                  <div style={{ fontWeight: 600, color: '#1a2236', fontSize: 17 }}>Total: <span style={{ color: '#ffb300' }}>{order.total} Ksh</span></div>
                </div>
                <div style={{ color: '#888', fontSize: 15, marginBottom: 4 }}>
                  <em>Thank you for your order! We'll keep you updated on its progress.</em>
                </div>
                <button
                  style={{ background: '#1a2236', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 700, fontSize: 17, cursor: 'pointer', marginBottom: 12 }}
                  onClick={() => {
                    // Prefill cart with previous order's items and go to cart page
                    if (window && window.setCart && window.setPage) {
                      window.setCart(order.items.map(item => ({ ...item })));
                      window.setPage('cart');
                    } else if (typeof setCart === 'function' && typeof setPage === 'function') {
                      setCart(order.items.map(item => ({ ...item })));
                      setPage('cart');
                    } else {
                      // fallback: try to dispatch a custom event
                      const event = new CustomEvent('reorder', { detail: order.items.map(item => ({ ...item })) });
                      window.dispatchEvent(event);
                    }
                  }}
                >Re-Order</button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#888', fontSize: 22, fontWeight: 600, textAlign: 'center', marginTop: 60 }}>
            No past orders.
          </div>
        )
      )}
      {ratingOrderIndex != null && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', maxWidth: 560, width: '92vw', boxShadow: '0 4px 24px #0003' }}>
            <h3 style={{ marginTop: 0, fontSize: 22, fontWeight: 700, color: '#1a2236', marginBottom: 12 }}>Rate Your Order</h3>
            <div style={{ marginBottom: 12, color: '#6a708a' }}>Please rate each item and the delivery experience.</div>
            {(trackOrders[ratingOrderIndex]?.items || []).map((item, i) => (
              <div key={i} style={{ border: '1px solid #eef0f6', borderRadius: 12, padding: 12, marginBottom: 10 }}>
                <div style={{ fontWeight: 700, color: '#1a2236' }}>{item.name}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                  <label style={{ color: '#6a708a' }}>Stars</label>
                  <select value={(itemRatings[i]?.stars || 0)} onChange={e => setItemRatings(r => ({ ...r, [i]: { ...(r[i]||{}), stars: Number(e.target.value) } }))}
                          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e1e4ee' }}>
                    <option value={0}>Select</option>
                    {[1,2,3,4,5].map(s => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
                <textarea placeholder="Comment" value={(itemRatings[i]?.comment || '')} onChange={e => setItemRatings(r => ({ ...r, [i]: { ...(r[i]||{}), comment: e.target.value } }))}
                          style={{ marginTop: 8, width: '100%', minHeight: 60, borderRadius: 10, border: '1px solid #e1e4ee', padding: 10 }} />
              </div>
            ))}
            {((trackOrders[ratingOrderIndex]?.deliveryType || '').toLowerCase() === 'delivery') && (
              <div style={{ border: '1px solid #eef0f6', borderRadius: 12, padding: 12, marginBottom: 10 }}>
                <div style={{ fontWeight: 700, color: '#1a2236' }}>Delivery Experience</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                  <label style={{ color: '#6a708a' }}>Stars</label>
                  <select value={deliveryRating.stars} onChange={e => setDeliveryRating({ ...deliveryRating, stars: Number(e.target.value) })}
                          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e1e4ee' }}>
                    <option value={0}>Select</option>
                    {[1,2,3,4,5].map(s => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
                <textarea placeholder="Comment" value={deliveryRating.comment} onChange={e => setDeliveryRating({ ...deliveryRating, comment: e.target.value })}
                          style={{ marginTop: 8, width: '100%', minHeight: 60, borderRadius: 10, border: '1px solid #e1e4ee', padding: 10 }} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
              <button onClick={() => { setRatingOrderIndex(null); setItemRatings({}); setDeliveryRating({ stars: 0, comment: '' }); }}
                      style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid #e1e4ee', background: '#fff' }}>Cancel</button>
              <button onClick={async () => {
                const order = trackOrders[ratingOrderIndex];
                const promises = [];
                (order.items || []).forEach((item, i) => {
                  const r = itemRatings[i];
                  if (r && r.stars > 0) {
                    promises.push(fetch('/api/hotel/reviews', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ orderId: order.id, menuItem: item.id, type: 'item', rating: r.stars, comment: r.comment || '' })
                    }));
                  }
                });
                if (((order.deliveryType || '').toLowerCase() === 'delivery') && deliveryRating.stars > 0) {
                  promises.push(fetch('/api/hotel/reviews', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: order.id, type: 'delivery', rating: deliveryRating.stars, comment: deliveryRating.comment || '' })
                  }));
                }
                try { await Promise.all(promises); } catch {}
                // Mark order as rated to avoid future prompts
                setTrackOrders(prev => prev.map((o, i) => i === ratingOrderIndex ? { ...o, rated: true } : o));
                setRatingOrderIndex(null);
              }}
                      style={{ padding: '8px 14px', borderRadius: 10, border: 'none', background: '#1a2236', color: '#fff', fontWeight: 700 }}>Submit Ratings</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Track;
