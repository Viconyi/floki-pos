import React, { useEffect, useMemo, useState } from 'react';
import { HotelAPI, formatCurrency } from '../api';

function SaleItemCard({ item, onAdd }) {
  const hasOffer = !!item.offerActive && Number(item.offerPercent || 0) > 0;
  const discounted = hasOffer ? Number(item.price || 0) * (1 - Number(item.offerPercent || 0) / 100) : null;
  const priceEl = !hasOffer ? (
    <div style={{ fontWeight: 600, color: '#ffb300', fontSize: 17 }}>Ksh {Number(item.price || 0).toFixed(2)}</div>
  ) : (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ textDecoration: 'line-through', color: '#6a708a', fontSize: 15 }}>Ksh {Number(item.price || 0).toFixed(2)}</div>
      <div style={{ fontWeight: 700, color: '#1a2236', fontSize: 18 }}>Ksh {Number(discounted || 0).toFixed(2)}</div>
      <span style={{ background: '#ffefe0', color: '#b85600', borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>{Number(item.offerPercent || 0)}% OFF</span>
    </div>
  );
  return (
    <li style={{
      background: '#f7f7fa', borderRadius: 12, padding: 20, boxShadow: '0 1px 8px #0001',
      display: 'flex', alignItems: 'center', minHeight: 120, flexDirection: 'column', listStyle: 'none',
      maxWidth: 420, width: '100%', justifySelf: 'center'
    }}>
      {item.category === 'Foods' && item.image && (
        <div style={{ width: '100%', marginBottom: 10 }}>
          <img src={item.image} alt={item.name} style={{ width: '100%', maxHeight: 160, objectFit: 'cover', borderRadius: 8 }} />
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, width: '100%', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 700, fontSize: 20 }}>{item.name}</div>
      </div>
      {item.category === 'Foods' && (
        <div style={{ color: '#555', marginBottom: 6, width: '100%' }}>{item.description}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', justifyContent: 'space-between' }}>
        {priceEl}
        <button onClick={() => onAdd(item)} style={{ background: '#1a2236', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Add</button>
      </div>
    </li>
  );
}

function MpesaQR({ total, paymentMode }) {
  const [qrData, setQrData] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const prevTotal = React.useRef();
  const prevMode = React.useRef();

  React.useEffect(() => {
    // Only auto-generate if paymentMode is mpesa and total > 0
    if (paymentMode === 'mpesa' && total > 0 && (prevTotal.current !== total || prevMode.current !== paymentMode)) {
      generateQR();
    }
    prevTotal.current = total;
    prevMode.current = paymentMode;
    // eslint-disable-next-line
  }, [paymentMode, total]);

  async function generateQR() {
    setError('');
    setLoading(true);
    setQrData('');
    try {
      const payload = {
        MerchantName: 'Floki Hotel',
        RefNo: 'Sale-' + Date.now(),
        Amount: Number(total) || 1,
        TrxCode: 'BG',
        CPI: '174379', // Use your shortcode or business number
        Size: '300',
      };
      const res = await HotelAPI.generateQR(payload);
      const code = res && res.QRCode;
      if (!code) throw new Error(res && res.ResponseDescription ? res.ResponseDescription : 'No QRCode returned');
      setQrData(code);
    } catch (e) {
      setError(e && e.message ? e.message : 'Failed to generate QR');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 16, marginBottom: 8 }}>
      {loading && <span style={{ color: '#1a2236', fontWeight: 600 }}>Generating QR…</span>}
      {error && <span style={{ color: 'crimson', fontWeight: 600, marginLeft: 12 }}>{error}</span>}
      {qrData && (
        <div style={{ marginTop: 16 }}>
          <h4 style={{ margin: 0, color: '#1a2236' }}>QR Code</h4>
          <img alt="M-PESA QR" src={`data:image/png;base64,${qrData}`} style={{ width: 200, height: 200, border: '1px solid #e1e4ee', borderRadius: 8 }} />
        </div>
      )}
    </div>
  );
}

export default function MakeSalePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [utensils, setUtensils] = useState([]);
  const [condiments, setCondiments] = useState([]);
  const [cart, setCart] = useState([]);
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [mpesaStatus, setMpesaStatus] = useState('');
  const [mpesaPushed, setMpesaPushed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMode, setPaymentMode] = useState('cash'); // 'cash' | 'mpesa' | 'card'
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [markCompleted, setMarkCompleted] = useState(false);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
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
    load();
  }, []);

  useEffect(() => {
    fetch('/api/hotel/config')
      .then(res => res.ok ? res.json() : Promise.resolve({ utensils: [], condiments: [] }))
      .then(cfg => {
        setUtensils(Array.isArray(cfg.utensils) ? cfg.utensils : []);
        setCondiments(Array.isArray(cfg.condiments) ? cfg.condiments : []);
      })
      .catch(() => {});
  }, []);

  function addToCart(item) {
    setCart(prev => {
      const idx = prev.findIndex(ci => ci._id === item._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: (next[idx].qty || 1) + 1 };
        return next;
      }
      return [...prev, { ...item, qty: 1, selectedUtensils: [], selectedCondiments: [], notes: '' }];
    });
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(ci => ci._id !== id));
  }

  function updateCart(id, patch) {
    setCart(prev => prev.map(ci => (ci._id === id ? { ...ci, ...patch } : ci)));
  }

  function changeQty(id, delta) {
    setCart(prev => prev.map(ci => (
      ci._id === id ? { ...ci, qty: Math.max(1, (ci.qty || 1) + delta) } : ci
    )));
  }

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(item => {
      if (!q) return true;
      const fields = [item.name, item.description, item.category, item.type, String(item.price)]
        .concat(Array.isArray(item.ingredients) ? item.ingredients : []);
      return fields.filter(Boolean).some(f => String(f).toLowerCase().includes(q));
    });
  }, [items, query]);

  function unitPrice(item) {
    const price = Number(item.price || 0);
    const pct = Number(item.offerPercent || 0);
    if (!!item.offerActive && pct > 0) return price * (1 - pct / 100);
    return price;
  }

  const total = useMemo(() => {
    return cart.reduce((sum, it) => sum + unitPrice(it) * (it.qty || 1), 0);
  }, [cart]);

  function isValidMpesaNumber(num) {
    return (/^(07\d{8}|011\d{7})$/).test(num);
  }

  async function handleMpesaPush() {
    setMsg('');
    setMpesaStatus('Initiating M-Pesa payment...');
    setProcessing(true);
    try {
      if (!isValidMpesaNumber(mpesaNumber)) {
        throw new Error('Enter a valid Safaricom number (e.g., 07xxxxxxxx or 011xxxxxxx)');
      }
      let phone = mpesaNumber;
      if (phone.startsWith('0')) phone = '254' + phone.slice(1);
      const res = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(total), phone }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error((data.error && (data.error.message || data.error)) || (data.missing ? `Missing config: ${data.missing.join(', ')}` : 'M-Pesa push failed'));
      setMpesaStatus('STK Push sent. Ask client to enter M-Pesa PIN.');
      setMpesaPushed(true);
      setProcessing(false);
    } catch (err) {
      setMpesaStatus('');
      setMsg('M-Pesa error: ' + err.message);
      setProcessing(false);
      setTimeout(() => setMsg(''), 3000);
    }
  }

  async function createSale() {
    if (cart.length === 0) {
      setMsg('Add at least one item');
      setTimeout(() => setMsg(''), 2500);
      return;
    }
    if (paymentMode === 'mpesa') {
      if (!isValidMpesaNumber(mpesaNumber)) {
        setMsg('Enter a valid M-Pesa number');
        setTimeout(() => setMsg(''), 2500);
        return;
      }
      if (!mpesaPushed) {
        setMsg('Push STK first before creating the sale');
        setTimeout(() => setMsg(''), 2500);
        return;
      }
    }
    if (paymentMode === 'card') {
      const numOk = /^\d{12,19}$/.test(card.number.replace(/\s+/g, ''));
      const nameOk = !!card.name.trim();
      const expOk = /^\d{2}\/\d{2}$/.test(card.expiry.trim());
      const cvvOk = /^\d{3,4}$/.test(card.cvv.trim());
      if (!numOk || !nameOk || !expOk || !cvvOk) {
        setMsg('Enter valid card details');
        setTimeout(() => setMsg(''), 2500);
        return;
      }
    }
    const confirmText = `Confirm Create Sale for ${formatCurrency(Number(total.toFixed(2)))}?`;
    if (!window.confirm(confirmText)) {
      return;
    }
    setCreating(true);
    setMsg('');
    try {
      let staffDisplayName = null;
      try { staffDisplayName = typeof localStorage !== 'undefined' ? localStorage.getItem('staffDisplayName') : null; } catch {}
      const payload = {
        clientPhone: paymentMode === 'mpesa' && mpesaNumber ? ('+254' + mpesaNumber.slice(1)) : undefined,
        servedByName: staffDisplayName || undefined,
        saleType: 'Over the Counter',
        status: 'completed',
        items: cart.map(ci => ({
          menuItem: ci._id,
          quantity: ci.qty || 1,
          utensils: ci.selectedUtensils || [],
          condiments: ci.selectedCondiments || [],
          notes: ci.notes || undefined,
        })),
        total: Number(total.toFixed(2)),
        paymentStatus: paymentMode === 'cash' || paymentMode === 'card' ? 'paid' : 'pending',
      };
      const order = await HotelAPI.createOrder(payload);
      if (markCompleted && order && order._id) {
        await HotelAPI.updateOrder(order._id, { status: 'completed', servedByName: staffDisplayName || undefined });
      }
      // Generate ETR after sale (no personal details), but do not open or navigate to receipt
      if (order && order._id) {
        try {
          await HotelAPI.generateETR(order._id);
          // ETR is generated and saved in background; do not open or navigate
        } catch (e) {
          // Ignore ETR errors for now
        }
      }
      setCart([]);
      setMpesaNumber(''); setMpesaStatus(''); setMpesaPushed(false);
      setPaymentMode('cash'); setCard({ number: '', name: '', expiry: '', cvv: '' });
      setMsg('Sale created');
      setTimeout(() => setMsg(''), 2500);
    } catch (err) {
      setMsg(err.message || 'Failed to create sale');
      setTimeout(() => setMsg(''), 3000);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <h2 style={{ margin: 0, color: '#1a2236' }}>Make a Sale</h2>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="search"
            placeholder="Search…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e1e4ee', minWidth: 220 }}
          />
        </div>
      </div>
      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'crimson' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <ul style={{
          listStyle: 'none', padding: 0, margin: 0,
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', justifyItems: 'center', gap: 20, width: '100%'
        }}>
          {filteredItems.map(item => (
            <SaleItemCard key={item._id} item={item} onAdd={addToCart} />
          ))}
        </ul>

        <div style={{ border: '1px solid #eef0f6', borderRadius: 12, padding: 12, background: '#fafbfe' }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: '#1a2236' }}>Cart</div>
          {cart.length === 0 && <div style={{ color: '#6a708a' }}>No items yet.</div>}
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
            {cart.map(ci => (
              <li key={ci._id} style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 6px #0001', padding: '8px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontWeight: 700, color: '#1a2236', flex: 1 }}>{ci.name}</div>
                  <button onClick={() => removeFromCart(ci._id)} style={{ border: 'none', background: '#ffe9e6', color: '#b23b2e', borderRadius: 6, padding: '6px 10px' }}>Remove</button>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
                  <label style={{ color: '#6a708a' }}>Qty</label>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => changeQty(ci._id, -1)}
                            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e1e4ee', background: '#fff', color: '#1a2236', fontWeight: 700 }}>-</button>
                    <div style={{ minWidth: 28, textAlign: 'center', fontWeight: 700, color: '#1a2236' }}>{ci.qty}</div>
                    <button onClick={() => changeQty(ci._id, +1)}
                            style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e1e4ee', background: '#fff', color: '#1a2236', fontWeight: 700 }}>+</button>
                  </div>
                  <span style={{ marginLeft: 'auto', fontWeight: 700, color: '#ffb300' }}>
                    {formatCurrency(unitPrice(ci) * (ci.qty || 1))}
                  </span>
                </div>
                {utensils.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 600, color: '#1a2236' }}>Utensils</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                      {utensils.map(u => {
                        const checked = (ci.selectedUtensils || []).includes(u);
                        return (
                          <label key={u} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f7f7fa', border: '1px solid #e1e4ee', borderRadius: 999, padding: '4px 10px' }}>
                            <input type="checkbox" checked={checked}
                                   onChange={e => {
                                     const next = new Set(ci.selectedUtensils || []);
                                     if (e.target.checked) next.add(u); else next.delete(u);
                                     updateCart(ci._id, { selectedUtensils: Array.from(next) });
                                   }} />
                            <span>{u}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
                {condiments.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontWeight: 600, color: '#1a2236' }}>Condiments</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                      {condiments.map(c => {
                        const checked = (ci.selectedCondiments || []).includes(c);
                        return (
                          <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f7f7fa', border: '1px solid #e1e4ee', borderRadius: 999, padding: '4px 10px' }}>
                            <input type="checkbox" checked={checked}
                                   onChange={e => {
                                     const next = new Set(ci.selectedCondiments || []);
                                     if (e.target.checked) next.add(c); else next.delete(c);
                                     updateCart(ci._id, { selectedCondiments: Array.from(next) });
                                   }} />
                            <span>{c}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 12, borderTop: '1px solid #eef0f6', paddingTop: 12, display: 'grid', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>Payment Mode</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="radio" name="paymode" checked={paymentMode === 'cash'} onChange={() => setPaymentMode('cash')} /> Cash
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="radio" name="paymode" checked={paymentMode === 'mpesa'} onChange={() => setPaymentMode('mpesa')} /> M-Pesa
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="radio" name="paymode" checked={paymentMode === 'card'} onChange={() => setPaymentMode('card')} /> Card
                  </label>
                </div>
              </div>
              {paymentMode === 'mpesa' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'end' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>M-Pesa Number</label>
                      <input value={mpesaNumber} onChange={e => setMpesaNumber(e.target.value)} placeholder="07xxxxxxxx or 011xxxxxxx" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e1e4ee' }} />
                    </div>
                    <button onClick={handleMpesaPush} disabled={processing || total <= 0} style={{ background: '#ffb300', color: '#1a2236', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700 }}>
                      {processing ? 'Pushing…' : 'Push STK'}
                    </button>
                  </div>
                  {/* QR Payment Option */}
                  <MpesaQR total={total} paymentMode={paymentMode} />
                  {mpesaStatus && <div style={{ color: '#6a708a' }}>{mpesaStatus}</div>}
                </>
              )}

              {paymentMode === 'card' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>Card Number</label>
                    <input value={card.number} onChange={e => setCard({ ...card, number: e.target.value })} placeholder="1234 5678 9012 3456" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e1e4ee' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>Name on Card</label>
                    <input value={card.name} onChange={e => setCard({ ...card, name: e.target.value })} placeholder="Full Name" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e1e4ee' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>Expiry (MM/YY)</label>
                    <input value={card.expiry} onChange={e => setCard({ ...card, expiry: e.target.value })} placeholder="MM/YY" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e1e4ee' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>CVV</label>
                    <input value={card.cvv} onChange={e => setCard({ ...card, cvv: e.target.value })} placeholder="123" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e1e4ee' }} />
                  </div>
                </div>
              )}
              <div style={{ fontWeight: 800, fontSize: 18, color: '#1a2236' }}>Total: {formatCurrency(total)}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={createSale} disabled={creating} style={{ background: '#1a2236', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700 }}>
                {creating ? 'Creating…' : 'Create Sale'}
              </button>
              {msg && <span style={{ color: msg === 'Sale created' ? '#1a8f3c' : 'crimson', fontWeight: 600 }}>{msg}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
