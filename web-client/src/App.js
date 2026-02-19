// --- Past Orders and Ratings ---
function PastOrdersPage({ orders, onRate }) {
  return (
    <div>
      <h2 style={{ color: '#1a2236' }}>Past Orders</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {orders.map(order => (
          <li key={order._id} style={{ background: '#f7f7fa', borderRadius: 12, margin: '16px 0', padding: 18, boxShadow: '0 1px 8px #0001' }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Order #{order._id}</div>
            <div>Status: {order.status}</div>
            <div>Total: Ksh {order.total}</div>
            <div>Items:</div>
            <ul style={{ paddingLeft: 18 }}>
              {order.items.map((item, idx) => (
                <li key={idx} style={{ marginBottom: 6 }}>
                  {item.menuItem?.name || 'Item'} x{item.quantity}
                  <button style={{ marginLeft: 12, background: '#ffb300', color: '#222', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 600, cursor: 'pointer' }}
                    onClick={() => onRate(order, item)}>
                    Rate Now
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {orders.length === 0 && <div style={{ color: '#6a708a' }}>No past orders found.</div>}
    </div>
  );
}
import React, { useState, useMemo } from 'react';

// Sign In Modal
function SignInModal({ open, onClose, onSignIn }) {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0007', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px #0003', padding: '2.5rem 2rem', minWidth: 340, maxWidth: 400, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 24, color: '#888', cursor: 'pointer' }}>&times;</button>
        <img src={process.env.PUBLIC_URL + '/FoodLoki.png'} alt="FoodLoki Logo" style={{ width: 80, margin: '0 auto 18px', display: 'block' }} />
        <h2 style={{ color: '#1a2236', fontWeight: 700, fontSize: 28, marginBottom: 18 }}>Sign In</h2>
        <form onSubmit={e => { e.preventDefault(); onSignIn(email, pin); }} style={{ width: '100%' }}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ ...inputStyle }} />
          <input type="number" placeholder="PIN (4-6 digits)" value={pin} onChange={e => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0,6))} required style={{ ...inputStyle }} minLength={4} maxLength={6} />
          <button type="submit" style={{ width: '100%', background: '#1a2236', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginBottom: 8, boxShadow: '0 2px 8px #1a223633' }}>Sign In</button>
        </form>
        <button onClick={onClose} style={{ width: '100%', background: '#f7f7fa', color: '#222', border: 'none', borderRadius: 12, padding: '14px', fontWeight: 700, fontSize: 18, cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  );
}

  function isValidCard(card) {
    // Card number: 16 digits, expiry: MM/YY, CVC: 3 or 4 digits
    const numValid = /^\d{16}$/.test(card.number);
    const nameValid = card.name.trim().length > 0;
    const expValid = /^(0[1-9]|1[0-2])\/(\d{2})$/.test(card.expiry);
    const cvcValid = /^\d{3,4}$/.test(card.cvv);
    return numValid && nameValid && expValid && cvcValid;
  }


// Sign Out Modal
function SignOutModal({ open, onClose, onSignOut }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0007', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 24, boxShadow: '0 8px 32px #0003', padding: '2.5rem 2rem', minWidth: 340, maxWidth: 400, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 24, color: '#888', cursor: 'pointer' }}>&times;</button>
        <h2 style={{ color: '#1a2236', fontWeight: 700, fontSize: 28, marginBottom: 18 }}>Sign Out</h2>
        <div style={{ color: '#555', fontSize: 17, marginBottom: 24, textAlign: 'center' }}>Are you sure you want to sign out?</div>
        <button
          style={{ width: '100%', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 12, padding: '14px', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginBottom: 8, boxShadow: '0 2px 8px #e74c3c33' }}
          onClick={onSignOut}
        >Sign Out</button>
        <button
          style={{ width: '100%', background: '#f7f7fa', color: '#222', border: 'none', borderRadius: 12, padding: '14px', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginBottom: 8 }}
          onClick={onClose}
        >Cancel</button>
      </div>
    </div>
  );
}

// Remove the old logout button and add a floating one at the bottom right
function handleLogout() {
  setUser(null);
  setShowSignOut(false);
}

import Track from './Track';

// The reorder event listener must be inside the App component to use hooks
// Placeholder MENU and OFFERS removed; data is loaded from backend

const inputStyle = {
  display: 'block',
  margin: '8px 0',
  padding: '8px',
  borderRadius: 6,
  border: '1px solid #ccc',
  width: '100%',
  fontSize: 16,
};

function MenuPage({ menu, handleOrder, selectedCategory, setSelectedCategory }) {
  const categories = ['breakfast', 'brunch', 'lunch', 'dinner', 'supper', 'specials'];
  const [openIngredients, setOpenIngredients] = useState({});
  const [specialsType, setSpecialsType] = useState('all');
  const [selectingQty, setSelectingQty] = useState(null); // food.id
  const [qty, setQty] = useState(1);
  const [query, setQuery] = useState('');
  React.useEffect(() => {
    function resetQty() {
      setSelectingQty(null);
      setQty(1);
    }
    window.addEventListener('resetSelectingQty', resetQty);
    return () => window.removeEventListener('resetSelectingQty', resetQty);
  }, []);
  function toggleIngredients(id) {
    setOpenIngredients(prev => ({ ...prev, [id]: !prev[id] }));
  }
  let foods = menu || [];
  // For specials, apply an optional sub-filter using simple heuristics
  if (selectedCategory === 'specials') {
    foods = (menu || []).filter(f => {
      if (specialsType === 'all') return true;
      const text = `${f.name || ''} ${f.desc || ''}`.toLowerCase();
      if (specialsType === 'chef') return text.includes('chef');
      if (specialsType === 'day') return text.includes('day');
      if (specialsType === 'vegan') return text.includes('vegan');
      if (specialsType === 'vegetarian') return text.includes('vegetarian') || text.includes('vegeterian');
      return true;
    });
  }
  const filteredFoods = (foods || []).filter(f => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const fields = [f.name, f.desc].concat(Array.isArray(f.ingredients) ? f.ingredients : []);
    return fields.filter(Boolean).some(x => String(x).toLowerCase().includes(q));
  });
  return (
    <div>
      <h2 style={{ color: '#1a2236' }}>Menu</h2>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <input
          type="search"
          placeholder="Search dishes…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e1e4ee', minWidth: 240 }}
        />
      </div>
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => setSelectedCategory(cat)}
          style={{
            background: selectedCategory === cat ? '#ffb300' : '#f7f7fa',
            color: selectedCategory === cat ? '#222' : '#555',
            border: 'none',
            borderRadius: 6,
            padding: '8px 18px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 16,
            transition: 'background 0.2s',
            minWidth: 120,
          }}
        >
          {cat.charAt(0).toUpperCase() + cat.slice(1)}
        </button>
      ))}
    </div>
    {selectedCategory === 'specials' && (
      <div style={{ marginBottom: 24, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {['all', 'chef', 'day', 'vegan', 'vegetarian'].map(type => (
          <button
            key={type}
            onClick={() => setSpecialsType(type)}
            style={{
              background: specialsType === type ? '#ffb300' : '#f7f7fa',
              color: specialsType === type ? '#222' : '#555',
              border: 'none',
              borderRadius: 6,
              padding: '8px 18px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 16,
              transition: 'background 0.2s',
              minWidth: 120,
            }}
          >
            {type === 'all' ? 'All' : type === 'chef' ? "Chef's Special" : type === 'day' ? "Day's Special" : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
    )}
    <ul style={{
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: 32,
      width: '100%',
    }}>
      {filteredFoods.map(food => (
        <li key={food.id} style={{
          background: '#f7f7fa',
          borderRadius: 12,
          padding: 20,
          boxShadow: '0 1px 8px #0001',
          display: 'flex',
          alignItems: 'center',
          minHeight: 120,
          flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <img src={food.img} alt={food.name} style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10, marginRight: 20 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 20 }}>{food.name}</div>
              <div style={{ color: '#555', marginBottom: 6 }}>{food.desc}</div>
              {food.offerActive && food.offerPercent > 0 ? (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <div style={{ fontWeight: 600, color: '#ff5252', fontSize: 17 }}>Ksh {Math.round(food.price * (1 - food.offerPercent / 100))}</div>
                  <div style={{ color: '#888', textDecoration: 'line-through' }}>Ksh {food.price}</div>
                  <span style={{ background: '#ffb300', color: '#222', borderRadius: 6, padding: '2px 8px', fontWeight: 700, fontSize: 12 }}>-{food.offerPercent}%</span>
                </div>
              ) : (
                <div style={{ fontWeight: 600, color: '#ffb300', fontSize: 17 }}>Ksh {food.price}</div>
              )}
              <div style={{ margin: '6px 0' }}>
                {typeof food.averageRating === 'number' && food.ratingCount > 0 ? (
                  <span style={{ color: '#f39c12', fontWeight: 600 }}>
                    Avg Rating: {food.averageRating.toFixed(1)} ★ ({food.ratingCount})
                  </span>
                ) : (
                  <span style={{ color: '#888', fontWeight: 500 }}>No ratings yet</span>
                )}
              </div>
              {selectingQty === food.id ? (
                <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                  <button onClick={() => setQty(qty > 1 ? qty - 1 : 1)} style={{ background: '#e0e0e0', color: '#222', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 18 }}>-</button>
                  <span style={{ margin: '0 12px', fontWeight: 700, fontSize: 18 }}>{qty}</span>
                  <button onClick={() => setQty(qty + 1)} style={{ background: '#e0e0e0', color: '#222', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 18 }}>+</button>
                  <button onClick={() => handleOrder({ ...food, quantity: qty })} style={{ marginLeft: 18, background: '#1a2236', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Order</button>
                </div>
              ) : (
                <button onClick={() => { setSelectingQty(food.id); setQty(1); }} style={{ marginTop: 8, background: '#1a2236', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Order</button>
              )}
              <button onClick={() => toggleIngredients(food.id)} style={{ marginTop: 8, background: openIngredients[food.id] ? '#ffb300' : '#e0e0e0', color: '#222', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}>See Ingredients</button>
            </div>
          </div>
          {openIngredients[food.id] && (
            <div style={{ marginTop: 12, width: '100%' }}>
              <div style={{ fontWeight: 600, color: '#1a2236', marginBottom: 6 }}>Ingredients:</div>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {food.ingredients.map((ing, idx) => (
                  <li key={idx} style={{ color: '#555', fontSize: 15 }}>{ing}</li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
      </ul>
      {filteredFoods.length === 0 && (
        <div style={{ textAlign: 'center', color: '#6a708a', marginTop: 12 }}>No items match your search.</div>
      )}
    </div>
  );
}

function OffersPage({ items }) {
  return (
    <div>
      <h2 style={{ color: '#1a2236' }}>Offers</h2>
      <ul style={{
        listStyle: 'none', padding: 0, margin: 0,
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24
      }}>
        {items.map(food => (
          <li key={food.id} style={{ background: '#f7f7fa', borderRadius: 12, padding: 16, boxShadow: '0 1px 8px #0001' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {food.img && <img src={food.img} alt={food.name} style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 10, marginRight: 20 }} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{food.name}</div>
                {food.desc && <div style={{ color: '#555', marginBottom: 6 }}>{food.desc}</div>}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <div style={{ fontWeight: 600, color: '#ff5252', fontSize: 17 }}>Ksh {Math.round(food.price * (1 - food.offerPercent / 100))}</div>
                  <div style={{ color: '#888', textDecoration: 'line-through' }}>Ksh {food.price}</div>
                  <span style={{ background: '#ffb300', color: '#222', borderRadius: 6, padding: '2px 8px', fontWeight: 700, fontSize: 12 }}>-{food.offerPercent}%</span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {items.length === 0 && <div style={{ color: '#6a708a' }}>No active offers.</div>}
    </div>
  );
}

// Dedicated Sign In Page (gate to the app)
function SignInPage({ onSignIn, onSignUp, onResetPin }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'reset'
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [sex, setSex] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [code, setCode] = useState('');
  const [showPin, setShowPin] = useState(false);
  const isValidEmail = e => /^\S+@\S+\.\S+$/.test(e);
  const isValidPin = p => /^\d{4,6}$/.test(p);
  const isValidPhone = p => /^(07\d{8}|011\d{7})$/.test(p);
  const isValidDob = d => {
    const y = new Date(d).getFullYear();
    const cy = new Date().getFullYear();
    return Number.isFinite(y) && y >= 1900 && y <= cy;
  };

  function submit(e) {
    e.preventDefault();
    if (mode === 'signin') {
      if (!isValidEmail(email)) { alert('Please enter a valid email.'); return; }
      if (!isValidPin(pin)) { alert('Enter a 4-6 digit PIN.'); return; }
      onSignIn(email, pin);
    } else if (mode === 'signup' && !awaitingCode) {
      if (!firstName.trim()) { alert('Please enter your first name.'); return; }
      if (!lastName.trim()) { alert('Please enter your last name.'); return; }
      if (!isValidDob(dob)) { alert('Please select a valid date of birth.'); return; }
      if (!sex) { alert('Please select your sex.'); return; }
      if (!isValidPhone(phone)) { alert('Enter phone as 07XXXXXXXX or 011XXXXXXX.'); return; }
      if (!isValidEmail(email)) { alert('Please enter a valid email.'); return; }
      if (!isValidPin(pin)) { alert('Enter a 4-6 digit PIN.'); return; }
      if (pin !== confirmPin) { alert('PINs do not match.'); return; }
      const yob = new Date(dob).getFullYear();
      // Init registration, send confirmation code
      fetch('/api/auth/register-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim(), yob, sex, phone, email, pin })
      })
        .then(async res => {
          if (res.ok) return res.json();
          let data; try { data = await res.json(); } catch {}
          throw new Error(data?.error || 'Failed to send confirmation code');
        })
        .then(() => { setAwaitingCode(true); })
        .catch(err => alert(err.message));
    } else if (mode === 'signup' && awaitingCode) {
      if (!isValidEmail(email)) { alert('Please enter a valid email.'); return; }
      if (!code || code.length !== 6) { alert('Enter the 6-digit confirmation code.'); return; }
      fetch('/api/auth/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })
        .then(async res => {
          if (res.ok) return res.json();
          let data; try { data = await res.json(); } catch {}
          throw new Error(data?.error || 'Failed to verify code');
        })
        .then(() => {
          const yob = new Date(dob).getFullYear();
          onSignUp({ firstName: firstName.trim(), lastName: lastName.trim(), yob, sex, phone, email, pin });
        })
        .catch(err => alert(err.message));
    } else {
      if (!isValidEmail(email)) { alert('Please enter a valid email.'); return; }
      onResetPin(email);
    }
  }

  const cardStyle = {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 12px 30px rgba(0,0,0,0.10)',
    border: '1px solid #e6e8eb',
    padding: '2rem 1.75rem',
    width: '92vw',
    maxWidth: 520,
    fontFamily: 'system-ui, -apple-system, Segoe UI, Inter, Arial, sans-serif'
  };
  const titleStyle = {
    fontSize: 26,
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 16px 0',
    letterSpacing: 0.2,
  };
  const fieldStyle = {
    width: '100%',
    border: '1px solid #ddd',
    borderRadius: 10,
    padding: '12px 14px',
    fontSize: 16,
    outline: 'none',
    margin: '10px 0',
    background: '#f7f7fa',
    boxSizing: 'border-box',
    display: 'block',
    maxWidth: '100%'
  };
  const primaryBtn = {
    width: '100%',
    background: '#ffb300',
    color: '#222',
    border: 'none',
    borderRadius: 12,
    padding: '12px 16px',
    fontWeight: 700,
    fontSize: 18,
    cursor: 'pointer',
    boxShadow: '0 2px 8px #1a223633',
    marginTop: 12
  };
  const linkStyle = {
    color: '#ffb300',
    background: 'transparent',
    border: 'none',
    padding: 0,
    margin: 0,
    cursor: 'pointer',
    fontSize: 14,
    textDecoration: 'underline'
  };
  const pinWrapStyle = {
    position: 'relative',
    width: '100%',
    overflow: 'hidden'
  };
  const pinToggleStyle = {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    color: '#ffb300',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    lineHeight: 0
  };
  const pinFieldStyle = {
    ...fieldStyle,
    paddingRight: '48px'
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 16,
      background: '#f7f7fa',
      position: 'relative'
    }}>
      <div style={{ color: '#1a2236', fontWeight: 800, fontSize: 30, letterSpacing: 0.5, fontFamily: 'system-ui, -apple-system, Segoe UI, Inter, Arial, sans-serif', textAlign: 'center' }}>Floki's</div>
      <div style={cardStyle}>
        <img src={process.env.PUBLIC_URL + '/FoodLoki.png'} alt="FoodLoki Logo" style={{ width: 80, margin: '0 auto 18px', display: 'block' }} />
        <div style={titleStyle}>{mode === 'signin' ? 'Login' : mode === 'signup' ? 'Register' : 'Reset PIN'}</div>
        <form onSubmit={submit}>
          {mode === 'signup' && !awaitingCode && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} style={fieldStyle} required />
                <input type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} style={fieldStyle} required />
              </div>
              <input type="date" placeholder="Date of Birth" value={dob} onChange={e => setDob(e.target.value)} style={fieldStyle} required max={new Date().toISOString().slice(0,10)} />
              <select value={sex} onChange={e => setSex(e.target.value)} style={fieldStyle} required>
                <option value="">Sex</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input
                type="tel"
                inputMode="tel"
                placeholder="Tel (07XXXXXXXX or 011XXXXXXX)"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0,10))}
                style={fieldStyle}
                required
                maxLength={10}
              />
            </>
          )}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={fieldStyle} required />
          {mode !== 'reset' && (
            <div style={pinWrapStyle}>
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder={mode==='signin' ? 'PIN' : 'Choose PIN'}
                value={pin}
                onChange={e => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0,6))}
                required
                style={pinFieldStyle}
                autoComplete="one-time-code"
              />
              <button type="button" aria-label="Toggle PIN visibility" onClick={() => setShowPin(s => !s)} style={pinToggleStyle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {showPin ? (
                    <path d="M2 2l20 20M12 5c-7 0-10 7-10 7s2.5 4.5 7 6l9-9c-2-3.5-6-4-6-4z" stroke="#ffb300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  ) : (
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12zm11-4a4 4 0 100 8 4 4 0 000-8z" fill="#ffb300"/>
                  )}
                </svg>
              </button>
            </div>
          )}
          {mode === 'signup' && !awaitingCode && (
            <div style={pinWrapStyle}>
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Confirm PIN"
                value={confirmPin}
                onChange={e => setConfirmPin(e.target.value.replace(/[^0-9]/g, '').slice(0,6))}
                required
                style={pinFieldStyle}
                autoComplete="one-time-code"
              />
              <button type="button" aria-label="Toggle PIN visibility" onClick={() => setShowPin(s => !s)} style={pinToggleStyle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {showPin ? (
                    <path d="M2 2l20 20M12 5c-7 0-10 7-10 7s2.5 4.5 7 6l9-9c-2-3.5-6-4-6-4z" stroke="#ffb300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  ) : (
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12zm11-4a4 4 0 100 8 4 4 0 000-8z" fill="#ffb300"/>
                  )}
                </svg>
              </button>
            </div>
          )}
          {mode === 'signup' && awaitingCode && (
            <>
              <div style={pinWrapStyle}>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter Confirmation Code"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0,6))}
                  style={fieldStyle}
                  required
                  maxLength={6}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#6b7280', fontSize: 14 }}>A confirmation code was sent to your email.</div>
                <button
                  type="button"
                  style={linkStyle}
                  onClick={() => {
                    const yobVal = new Date(dob).getFullYear();
                    fetch('/api/auth/register-init', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim(), yob: yobVal, sex, phone, email, pin })
                    })
                      .then(async res => {
                        if (res.ok) return res.json();
                        let data; try { data = await res.json(); } catch {}
                        throw new Error(data?.error || 'Failed to resend code');
                      })
                      .then(() => alert('Code resent'))
                      .catch(err => alert(err.message));
                  }}
                >Resend Code</button>
              </div>
            </>
          )}
          <button type="submit" style={primaryBtn}>
            {mode === 'signin' ? 'Log In' : mode === 'signup' ? (awaitingCode ? 'Verify Code' : 'Send Code') : 'Send Reset Link'}
          </button>
        </form>

        {mode === 'signup' && awaitingCode && null}

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {mode === 'signin' && (
            <>
              <span style={{ color: '#6b7280', fontSize: 14 }}>Don't have an account?</span>
              <button type="button" onClick={() => setMode('signup')} style={linkStyle}>Register</button>
            </>
          )}
          {mode === 'signup' && (
            <>
              <span style={{ color: '#6b7280', fontSize: 14 }}>Already have an account?</span>
              <button type="button" onClick={() => setMode('signin')} style={linkStyle}>Sign In</button>
            </>
          )}
          {mode === 'reset' && (
            <>
              <span style={{ color: '#6b7280', fontSize: 14 }}>Remember your PIN?</span>
              <button type="button" onClick={() => setMode('signin')} style={linkStyle}>Sign In</button>
            </>
          )}
        </div>
        {mode === 'signin' && (
          <div style={{ marginTop: 8, textAlign: 'right' }}>
            <button type="button" onClick={() => setMode('reset')} style={linkStyle}>Forgot PIN?</button>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  // Auth modal states
  const [showSignIn, setShowSignIn] = useState(false); // no longer auto-opened; kept for future use if needed
  const [showSignOut, setShowSignOut] = useState(false);
  const [user, setUser] = useState(null);

  // Persist user session across refreshes
  React.useEffect(() => {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('clientUser') : null;
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.email) {
          setUser(saved);
          setProfile(prev => ({
            ...prev,
            name: saved.name || prev.name,
            email: saved.email,
            phone: saved.phone || prev.phone,
          }));
        }
      }
    } catch {}
  }, []);

  function handleSignIn(email, pin) {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      alert('Please enter a valid email.');
      return;
    }
    if (!pin || !/^\d{4,6}$/.test(pin)) {
      alert('Please enter a 4-6 digit PIN.');
      return;
    }
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, pin })
    })
      .then(res => res.ok ? res.json() : res.json().then(d => Promise.reject(new Error(d.error || 'Login failed'))))
      .then(data => {
        // Persist name and phone from backend when available
        const nextUser = {
          email: data.user?.email || email,
          name: data.user?.name || undefined,
          phone: data.user?.phone || undefined,
        };
        setUser(nextUser);
        try { if (typeof localStorage !== 'undefined') localStorage.setItem('clientUser', JSON.stringify(nextUser)); } catch {}
        // Keep profile in sync for downstream usage
        setProfile(prev => ({
          ...prev,
          name: nextUser.name || prev.name,
          email: nextUser.email,
          phone: nextUser.phone || prev.phone,
        }));
        setShowSignIn(false);
      })
      .catch(err => alert(err.message));
  }
  function handleSignUp({ firstName, lastName, yob, sex, phone, email, pin }) {
    if (!email || !pin || pin.length < 4 || pin.length > 6) {
      alert('Please enter a valid email and 4-6 digit PIN.');
      return;
    }
    const nowYear = new Date().getFullYear();
    const age = String(nowYear - Number(yob));
    let formattedPhone = phone;
    if (/^(07\d{8}|011\d{7})$/.test(phone)) {
      formattedPhone = '+254' + phone.slice(1);
    }
    // Finalize locally: profile prefill and sign-in (backend persistence already done on verify)
    const fullName = `${firstName} ${lastName}`.trim();
    setProfile(prev => ({
      ...prev,
      name: fullName,
      age,
      sex,
      phone: formattedPhone,
      email,
    }));
    // Reflect name in the signed-in state immediately and persist
    const nextUser = { email, name: fullName, phone: formattedPhone };
    setUser(nextUser);
    try { if (typeof localStorage !== 'undefined') localStorage.setItem('clientUser', JSON.stringify(nextUser)); } catch {}
  }
  function handleResetPin(email) {
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      alert('Please enter a valid email.');
      return;
    }
    fetch('/api/auth/reset-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
      .then(res => res.ok ? res.json() : Promise.reject(new Error('Failed to send reset email')))
      .then(() => alert('Reset instructions have been sent to ' + email))
      .catch(err => alert(err.message));
  }
  function handleSignOut() {
    setUser(null);
    setShowSignOut(false);
    try { if (typeof localStorage !== 'undefined') localStorage.removeItem('clientUser'); } catch {}
    // Prompt sign-in again after signing out
    setShowSignIn(true);
  }

  const [trackOrders, setTrackOrders] = useState([
  ]);

  function handleCheckoutComplete(orderItems, deliveryType, grandTotal, orderId) {
    const paymentMethod = order.payment || 'Cash';
    setTrackOrders(prev => [
      ...prev,
      {
        id: orderId,
        items: orderItems,
        deliveryType,
        total: grandTotal,
        date: new Date(),
        status: 'Pending',
        paymentMethod,
        canCancel: true
      }
    ]);
    setCart([]);
    setPage('track');
    // Set timeout to disable cancel after 1 minute
    setTimeout(() => {
      setTrackOrders(prev => prev.map((order, idx) => {
        if (idx === prev.length - 1) {
          return { ...order, canCancel: false };
        }
        return order;
      }));
    }, 60000);
  }
  const [showCheckout, setShowCheckout] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [emailConfirmationMsg, setEmailConfirmationMsg] = useState('');
  const validateEmail = email => /^\S+@\S+\.\S+$/.test(email);
  const [lastSavedEmail, setLastSavedEmail] = useState('');
  React.useEffect(() => {
    setLastSavedEmail(profile.email);
  }, []);
  // Remove auto-open modal sign-in; gating is handled via SignInPage
  const [profileWarning, setProfileWarning] = useState('');
  const [profileMapOpen, setProfileMapOpen] = useState(false);
  const [profileEditing, setProfileEditing] = useState(true);
  // Placeholder: Replace with actual user account info from auth/profile
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    sex: '',
    phone: '',
    email: '',
    allergies: '',
    address: '',
  });
  const [page, setPage] = useState('menu');
  const [orderFood, setOrderFood] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [order, setOrder] = useState({ name: profile.name, phone: profile.phone, address: profile.address, payment: 'Cash', location: { lat: null, lng: null } });
  const [selectedCategory, setSelectedCategory] = useState('breakfast');
  const [showMap, setShowMap] = useState(false);

  const [instructions, setInstructions] = useState({ utensils: [], condiments: [], notes: '' });
  const [cart, setCart] = useState([]);
  const [cartNotification, setCartNotification] = useState('');
  // System notification helper
  function notify(title, body) {
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
      }
    } catch {}
  }
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(()=>{});
      }
    } catch {}
  }, []);
  function handleOrder(food) {
    if (!user) {
      // Gate prevents reaching here if not signed-in
      return;
    }
    setOrderFood(food);
    setPage('instructions');
  }
  function handleInstructionsSubmit(instr) {
    // Immediately add item to cart and return to menu
    const utensilPrices = { Spoon: 20, Plate: 50, Cup: 20 };
    const utensilCost = instr.utensils.reduce((sum, ut) => sum + (utensilPrices[ut] || 0), 0);
    const qty = instr.qty || 1;
    const unitPrice = orderFood.offerActive && orderFood.offerPercent > 0 ? Math.round(orderFood.price * (1 - orderFood.offerPercent / 100)) : orderFood.price;
    const total = qty * unitPrice + utensilCost;
    setCart([...cart, {
      id: orderFood.id,
      name: orderFood.name,
      qty,
      price: unitPrice,
      offerActive: !!orderFood.offerActive,
      offerPercent: Number(orderFood.offerPercent || 0),
      utensils: instr.utensils,
      condiments: instr.condiments,
      notes: instr.notes,
      deliveryNotes: instr.deliveryNotes,
      utensilCost,
      total,
      img: orderFood.img,
    }]);
    // Compose notification listing what was added
    let notif = `${qty} x ${orderFood.name}`;
    if (instr.utensils.length) notif += `, Utensils: ${instr.utensils.join(', ')}`;
    if (instr.condiments.length) notif += `, Condiments: ${instr.condiments.join(', ')}`;
    if (instr.notes) notif += `, Notes: ${instr.notes}`;
    if (instr.deliveryNotes) notif += `, Delivery: ${instr.deliveryNotes}`;
    notify('Added to cart', notif);
    setCartNotification(`${notif} added to cart.`);
    setTimeout(() => setCartNotification(''), 2200);
    setPage('menu');
    setOrderFood(null);
    setInstructions({ utensils: [], condiments: [], notes: '' });
    // Reset MenuPage selectingQty state if needed
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const evt = new CustomEvent('resetSelectingQty');
        window.dispatchEvent(evt);
      }, 250);
    }
  }
  function handleOrderSubmit(e) {
    e.preventDefault();
    // Add item to cart and skip name/location module
    const utensilPrices = { Spoon: 20, Plate: 50, Cup: 20 };
    const utensilCost = instructions.utensils.reduce((sum, ut) => sum + (utensilPrices[ut] || 0), 0);
    const qty = orderFood.qty || instructions.qty || 1;
    const unitPrice = orderFood.offerActive && orderFood.offerPercent > 0 ? Math.round(orderFood.price * (1 - orderFood.offerPercent / 100)) : orderFood.price;
    const total = qty * unitPrice + utensilCost;
    setCart([...cart, {
      id: orderFood.id,
      name: orderFood.name,
      qty,
      price: unitPrice,
      offerActive: !!orderFood.offerActive,
      offerPercent: Number(orderFood.offerPercent || 0),
      utensils: instructions.utensils,
      condiments: instructions.condiments,
      notes: instructions.notes,
      deliveryNotes: instructions.deliveryNotes,
      utensilCost,
      total,
      img: orderFood.img,
    }]);
    // Compose notification listing what was added
    let notif = `${qty} x ${orderFood.name}`;
    if (instructions.utensils.length) notif += `, Utensils: ${instructions.utensils.join(', ')}`;
    if (instructions.condiments.length) notif += `, Condiments: ${instructions.condiments.join(', ')}`;
    if (instructions.notes) notif += `, Notes: ${instructions.notes}`;
    if (instructions.deliveryNotes) notif += `, Delivery: ${instructions.deliveryNotes}`;
    setCartNotification(`${notif} added to cart.`);
    setTimeout(() => setCartNotification(''), 2200);
    setPage('menu');
    setOrderFood(null);
    setInstructions({ utensils: [], condiments: [], notes: '' });
    // Reset MenuPage selectingQty state if needed
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const evt = new CustomEvent('resetSelectingQty');
        window.dispatchEvent(evt);
      }, 250);
    }
  }
  function handleLocationChange() {
    // Placeholder: Replace with actual map/location picker logic
    setShowMap(true);
  }
  function handleMapSelect(lat, lng) {
    setOrder({ ...order, location: { lat, lng }, address: `Lat: ${lat}, Lng: ${lng}` });
    setShowMap(false);
  }

  // Viking art background image (unsplash, semi-transparent overlay)
  const vikingBg = 'https://images.unsplash.com/photo-1506744038136-462fa3a6a7f0?auto=format&fit=crop&w=1200&q=80';
  const [orders, setOrders] = useState([
  ]);
  function handleOrderComplete() {
    if (cart.length > 0) {
      setOrders(prevOrders => [...prevOrders, { items: cart, date: new Date(), status: 'Placed' }]);
      setCart([]);
      setPage('orders');
    } else {
      setPage('orders');
    }
  }
  // Fetch menu and offers from backend for client app
  const [clientMenu, setClientMenu] = useState([]);
  const [clientOffers, setClientOffers] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [menuError, setMenuError] = useState('');
  const [offersError, setOffersError] = useState('');
  const [hotelConfig, setHotelConfig] = useState({ utensils: [], condiments: [] });
  React.useEffect(() => {
    setLoadingMenu(true);
    setMenuError('');
    fetch('/api/admin/menu')
      .then(async res => {
        if (res.ok) return res.json();
        let text; try { text = await res.text(); } catch {}
        throw new Error(text || 'Failed to load menu');
      })
      .then(data => setClientMenu(Array.isArray(data) ? data : []))
      .catch(err => setMenuError(err.message))
      .finally(() => setLoadingMenu(false));
  }, []);
  React.useEffect(() => {
    setLoadingOffers(true);
    setOffersError('');
    fetch('/api/hotel/offers')
      .then(async res => {
        if (res.ok) return res.json();
        let text; try { text = await res.text(); } catch {}
        throw new Error(text || 'Failed to load offers');
      })
      .then(data => setClientOffers(Array.isArray(data) ? data : []))
      .catch(err => setOffersError(err.message))
      .finally(() => setLoadingOffers(false));
  }, []);
  React.useEffect(() => {
    fetch('/api/hotel/config')
      .then(res => res.ok ? res.json() : Promise.resolve({ utensils: [], condiments: [] }))
      .then(cfg => setHotelConfig({ utensils: Array.isArray(cfg.utensils) ? cfg.utensils : [], condiments: Array.isArray(cfg.condiments) ? cfg.condiments : [] }))
      .catch(() => setHotelConfig({ utensils: [], condiments: [] }));
  }, []);

  // Gate: render SignInPage, but keep hooks above unconditional to preserve order
  if (!user) {
    return <SignInPage onSignIn={handleSignIn} onSignUp={handleSignUp} onResetPin={handleResetPin} />;
  }

  function MenuWrapper({ selectedCategory, setSelectedCategory, handleOrder }) {
    // Map backend menu items into client categories
    const foods = clientMenu.filter(i => (i.category || 'Foods') === 'Foods');
    const byType = {
      breakfast: foods.filter(i => (i.type || 'Breakfast') === 'Breakfast'),
      brunch: foods.filter(i => (i.type || 'Breakfast') === 'Brunch'),
      lunch: foods.filter(i => (i.type || 'Breakfast') === 'Lunch'),
      dinner: foods.filter(i => (i.type || 'Breakfast') === 'Dinner'),
      supper: foods.filter(i => (i.type || 'Breakfast') === 'Supper'),
      specials: foods.filter(i => (i.type || '') === 'Specials'),
    };
    // Map fields to the shape MenuPage expects, including averageRating and ratingCount
    const mapItem = i => ({
      id: i._id,
      name: i.name,
      desc: i.description,
      price: i.price,
      img: i.image,
      rating: i.rating || undefined,
      averageRating: typeof i.averageRating === 'number' ? i.averageRating : (typeof i.avgRating === 'number' ? i.avgRating : undefined),
      ratingCount: typeof i.ratingCount === 'number' ? i.ratingCount : undefined,
      ingredients: Array.isArray(i.ingredients) ? i.ingredients : [],
      offerActive: !!i.offerActive,
      offerPercent: Number(i.offerPercent || 0)
    });
    const menu = (byType[selectedCategory] || []).map(mapItem);
    if (loadingMenu) return <div>Loading…</div>;
    if (menuError) return <div style={{ color: 'crimson' }}>{menuError}</div>;
    return (
      <MenuPage
        menu={menu}
        handleOrder={handleOrder}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
    );
  }

  function OffersWrapper() {
    if (loadingOffers) return <div>Loading…</div>;
    if (offersError) return <div style={{ color: 'crimson' }}>{offersError}</div>;
    // Show any menu item with an active offer
    const mapItem = i => ({ id: i._id, name: i.name, desc: i.description, price: i.price, img: i.image, offerPercent: Number(i.offerPercent || 0) });
    const offerItems = clientMenu
      .filter(i => !!i.offerActive && Number(i.offerPercent || 0) > 0)
      .map(mapItem);
    return <OffersPage items={offerItems} />;
  }

  return (
    <div style={{
      fontFamily: 'Inter, Arial, sans-serif',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        backgroundImage: `url(${vikingBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.35,
        filter: 'blur(2px)',
      }} />
      <div style={{ position: 'relative', zIndex: 1, height: '100vh', overflow: 'hidden' }}>
        <header style={{ position: 'fixed', top: 0, left: 0, width: '100vw', maxWidth: '100vw', background: 'rgba(26,34,54,0.98)', color: '#fff', padding: '1.2rem 1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 16px #0003', zIndex: 10, borderRadius: 0, fontSize: '1.2rem', flexWrap: 'wrap', boxSizing: 'border-box', overflow: 'hidden' }}>
          <span style={{ fontWeight: 700, fontSize: 24, letterSpacing: 0.5, fontFamily: 'system-ui, -apple-system, Segoe UI, Inter, Arial, sans-serif', flexShrink: 0 }}>Floki's</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 18, marginRight: '0.5cm' }}>
            <nav style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 18, fontSize: 18, flexShrink: 1, minWidth: 0 }}>
              <button onClick={() => setPage('menu')} style={{ background: page === 'menu' ? '#ffb300' : 'transparent', color: page === 'menu' ? '#222' : '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 18, padding: '8px 14px', borderRadius: 8, transition: 'background 0.2s', whiteSpace: 'nowrap', minWidth: 0 }}>Menu</button>
              <button onClick={() => setPage('offers')} style={{ background: page === 'offers' ? '#ffb300' : 'transparent', color: page === 'offers' ? '#222' : '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 18, padding: '8px 14px', borderRadius: 8, transition: 'background 0.2s', whiteSpace: 'nowrap', minWidth: 0 }}>Offers</button>
              <button onClick={() => setPage('cart')} style={{ background: page === 'cart' ? '#ffb300' : 'transparent', color: page === 'cart' ? '#222' : '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 18, padding: '8px 14px', borderRadius: 8, transition: 'background 0.2s', whiteSpace: 'nowrap', minWidth: 0 }}>
                Cart{cart.length > 0 ? ` (${cart.length})` : ''}
              </button>
              <button onClick={() => setPage('track')} style={{ background: page === 'track' ? '#ffb300' : 'transparent', color: page === 'track' ? '#222' : '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 18, padding: '8px 14px', borderRadius: 8, transition: 'background 0.2s', whiteSpace: 'nowrap', minWidth: 0 }}>Track</button>
            </nav>
            <button onClick={() => setPage('profile')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 44, marginRight: '0.5cm' }} aria-label="Profile">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill={page === 'profile' ? '#ffb300' : '#e0e0e0'} />
                <ellipse cx="16" cy="12" rx="6" ry="6" fill={page === 'profile' ? '#222' : '#888'} />
                <rect x="8" y="20" width="16" height="6" rx="3" fill={page === 'profile' ? '#222' : '#888'} />
              </svg>
            </button>
            {user && (
              <>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: 17, marginRight: 12 }}>{user.name || user.email}</span>
                <button onClick={() => setShowSignOut(true)} style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 16, cursor: 'pointer', marginLeft: 8 }}>Log Out</button>
              </>
            )}
          </div>
        </header>
        <main style={{ maxWidth: 900, width: '95vw', margin: '6.5rem auto 0 auto', background: 'rgba(255,255,255,0.92)', borderRadius: 18, boxShadow: '0 2px 24px #0002', padding: '2.5rem', backdropFilter: 'blur(2px)', height: 'calc(100vh - 6.5rem)', overflowY: 'auto', boxSizing: 'border-box', position: 'relative' }}>
          {cartNotification && (
            <div
              style={{
                position: 'fixed',
                bottom: 32,
                right: 32,
                background: '#ffb300',
                color: '#222',
                fontWeight: 600,
                fontSize: 18,
                borderRadius: 8,
                padding: '12px 28px',
                boxShadow: '0 2px 8px #0002',
                zIndex: 100,
                opacity: 1,
                transition: 'opacity 1s',
                animation: 'fadeoutnotif 2.2s forwards',
              }}
            >
              {cartNotification}
              <style>{`
                @keyframes fadeoutnotif {
                  0% { opacity: 1; }
                  80% { opacity: 1; }
                  100% { opacity: 0; }
                }
              `}</style>
            </div>
          )}
          {page === 'menu' && (
            <MenuWrapper
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              handleOrder={handleOrder}
            />
          )}
          {page === 'instructions' && orderFood && <InstructionsPage food={orderFood} onSubmit={handleInstructionsSubmit} config={hotelConfig} />}
          {/* OrderPage and name/location/payment module fully removed. Only allow adding to cart from instructions page. */}
          {page === 'track' && (
            <Track trackOrders={trackOrders} setTrackOrders={setTrackOrders} config={hotelConfig} />
          )}
          {page === 'offers' && <OffersWrapper />}
          {page === 'cart' && (
            <CartPage cart={cart} setCart={setCart} setPage={setPage} config={hotelConfig} />
          )}
          {page === 'checkout' && (
            <CheckoutPage
              cart={cart}
              setPage={setPage}
              checkoutPayment={order.payment}
              setCheckoutPayment={p => setOrder({ ...order, payment: p })}
              setCart={setCart}
              profile={profile}
              userEmail={user?.email}
              onCheckoutComplete={handleCheckoutComplete}
            />
          )}
          {page === 'profile' && (
            <div style={{ maxWidth: 420, margin: '2rem auto', background: '#fff', borderRadius: 24, boxShadow: '0 4px 32px #0002', padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2 style={{ color: '#1a2236', fontWeight: 700, fontSize: 28, marginBottom: 18 }}>Profile</h2>
              <form style={{ width: '100%' }} onSubmit={e => {
                e.preventDefault();
                if (!profile.name || !profile.age || !profile.sex || !profile.phone || !profile.email || !profile.allergies || !profile.address) {
                  setProfileWarning('Please fill all fields before saving.');
                  return;
                }
                if (!validateEmail(profile.email)) {
                  setProfileWarning('Please enter a valid email address.');
                  return;
                }
                setProfileEditing(false);
                setProfileWarning('');
                // If email changed, simulate sending confirmation
                if (profile.email !== lastSavedEmail) {
                  setEmailConfirmationMsg('A confirmation email has been sent to ' + profile.email + '. Please check your inbox to confirm your email address.');
                  setEmailConfirmed(false);
                  setLastSavedEmail(profile.email);
                } else {
                  setEmailConfirmationMsg('');
                }
              }}>
                                {/* Checkout popup removed. Checkout is now a dedicated page. */}
                                {emailConfirmationMsg && !emailConfirmed && (
                                  <div style={{ color: '#1a2236', fontWeight: 600, fontSize: 16, marginBottom: 12, background: '#fffbe6', borderRadius: 8, padding: '10px 18px', border: '1px solid #ffe082' }}>
                                    {emailConfirmationMsg}
                                    <button
                                      type="button"
                                      onClick={() => setEmailConfirmed(true)}
                                      style={{ marginLeft: 12, background: '#ffb300', color: '#222', border: 'none', borderRadius: 8, padding: '6px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}
                                    >
                                      Confirm Email
                                    </button>
                                  </div>
                                )}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 600, color: '#1a2236', fontSize: 18 }}>Name<span style={{ color: 'red' }}> *</span>:</label>
                  <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} style={{ ...inputStyle, borderColor: !profile.name && profileEditing ? 'red' : '#ccc', background: !profile.name && profileEditing ? '#fff0f0' : '#fff' }} placeholder="Full Name" required disabled={!profileEditing} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 600, color: '#1a2236', fontSize: 18 }}>Age<span style={{ color: 'red' }}> *</span>:</label>
                  <input type="number" value={profile.age} onChange={e => setProfile({ ...profile, age: e.target.value })} style={{ ...inputStyle, borderColor: !profile.age && profileEditing ? 'red' : '#ccc', background: !profile.age && profileEditing ? '#fff0f0' : '#fff' }} placeholder="Age" required disabled={!profileEditing} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 600, color: '#1a2236', fontSize: 18 }}>Sex<span style={{ color: 'red' }}> *</span>:</label>
                  <select value={profile.sex} onChange={e => setProfile({ ...profile, sex: e.target.value })} style={{ ...inputStyle, borderColor: !profile.sex && profileEditing ? 'red' : '#ccc', background: !profile.sex && profileEditing ? '#fff0f0' : '#fff' }} required disabled={!profileEditing}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 600, color: '#1a2236', fontSize: 18 }}>Phone<span style={{ color: 'red' }}> *</span>:</label>
                  <input type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} style={{ ...inputStyle, borderColor: !profile.phone && profileEditing ? 'red' : '#ccc', background: !profile.phone && profileEditing ? '#fff0f0' : '#fff' }} placeholder="Phone Number" required disabled={!profileEditing} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 600, color: '#1a2236', fontSize: 18 }}>Email<span style={{ color: 'red' }}> *</span>:</label>
                  <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} style={{ ...inputStyle, borderColor: !profile.email && profileEditing ? 'red' : '#ccc', background: !profile.email && profileEditing ? '#fff0f0' : '#fff' }} placeholder="Email Address" required disabled={!profileEditing} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 600, color: '#1a2236', fontSize: 18 }}>Allergies<span style={{ color: 'red' }}> *</span>:</label>
                  <textarea value={profile.allergies} onChange={e => setProfile({ ...profile, allergies: e.target.value })} style={{ ...inputStyle, borderColor: !profile.allergies && profileEditing ? 'red' : '#ccc', background: !profile.allergies && profileEditing ? '#fff0f0' : '#fff' }} placeholder="Any allergies?" required disabled={!profileEditing} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 600, color: '#1a2236', fontSize: 18 }}>Address<span style={{ color: 'red' }}> *</span>:</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="text" value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} style={{ ...inputStyle, flex: 1, borderColor: !profile.address && profileEditing ? 'red' : '#ccc', background: !profile.address && profileEditing ? '#fff0f0' : '#fff' }} required disabled={!profileEditing} />
                    {profileEditing && (
                      <button type="button" onClick={() => setProfileMapOpen(true)} style={{ background: '#ffb300', color: '#222', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 16 }}>Location</button>
                    )}
                  </div>
                </div>
                          {profileMapOpen && (
                            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <div style={{ background: '#fff', borderRadius: 16, padding: '2.5rem 2rem', maxWidth: 480, width: 'auto', boxShadow: '0 4px 32px #0003', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 'auto' }}>
                                <h3 style={{ marginTop: 0, fontSize: 24, fontWeight: 700, color: '#1a2236', marginBottom: 12 }}>Select Location</h3>
                                <div style={{ marginBottom: 18, width: '100%', maxWidth: 400, height: 300 }}>
                                  {/* Google Maps Embed API interactive map */}
                                  <iframe
                                    title="Google Map"
                                    width="100%"
                                    height="300"
                                    style={{ borderRadius: 8, border: 'none' }}
                                    src="https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=Kisii,Kenya"
                                    allowFullScreen
                                  ></iframe>
                                  <div style={{ color: '#888', fontSize: 15, marginTop: 8 }}>Drag map and click 'Set Location' to save.</div>
                                </div>
                                <div style={{ display: 'flex', gap: 18, justifyContent: 'center', width: '100%' }}>
                                  <button onClick={() => setProfileMapOpen(false)} style={{ background: '#e0e0e0', color: '#222', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, cursor: 'pointer', fontSize: 17 }}>Cancel</button>
                                  <button onClick={() => {
                                    // Simulate setting location, you can integrate with map click event for real coordinates
                                    setProfile({ ...profile, address: 'Lat: -1.2921, Lng: 36.8219' });
                                    setProfileMapOpen(false);
                                  }} style={{ background: '#1a2236', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, cursor: 'pointer', fontSize: 17 }}>Set Location</button>
                                </div>
                              </div>
                            </div>
                          )}
                {profileEditing ? (
                  <button
                    type="submit"
                    style={{ marginTop: 12, background: !profile.name || !profile.age || !profile.sex || !profile.phone || !profile.email || !profile.allergies || !profile.address ? '#ccc' : '#1a2236', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontWeight: 700, fontSize: 18, cursor: !profile.name || !profile.age || !profile.sex || !profile.phone || !profile.email || !profile.allergies || !profile.address ? 'not-allowed' : 'pointer', width: '100%' }}
                    disabled={
                      !profile.name || !profile.age || !profile.sex || !profile.phone || !profile.email || !profile.allergies || !profile.address
                    }
                  >
                    Save Profile
                  </button>
                ) : (
                  <button type="button" onClick={() => setProfileEditing(true)} style={{ marginTop: 12, background: '#ffb300', color: '#222', border: 'none', borderRadius: 10, padding: '12px 28px', fontWeight: 700, fontSize: 18, cursor: 'pointer', width: '100%' }}>Edit Profile</button>
                )}
                <button type="button" onClick={() => setPage('menu')} style={{ marginTop: 12, background: '#e0e0e0', color: '#222', border: 'none', borderRadius: 10, padding: '12px 28px', fontWeight: 700, fontSize: 18, cursor: 'pointer', width: '100%' }}>Back to Menu</button>
              </form>
            </div>
          )}
        </main>
      </div>
      {/* Auth Modals */}
      <SignOutModal open={showSignOut} onClose={() => setShowSignOut(false)} onSignOut={handleSignOut} />
      {/* Floating Log Out button removed per request */}
    </div>
  );
}

function InstructionsPage({ food, onSubmit, config }) {
  const [utensils, setUtensils] = useState([]);
  const [condiments, setCondiments] = useState([]);
  const [notes, setNotes] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [qty, setQty] = useState(food.quantity || 1);
  const availableCondiments = Array.isArray(config?.condiments) ? config.condiments : [];
  const availableUtensils = Array.isArray(config?.utensils) ? config.utensils : [];
  const utensilPrices = { Spoon: 20, Plate: 50, Cup: 20 };
  
  function toggleUtensil(ut) {
    setUtensils(utensils.includes(ut) ? utensils.filter(u => u !== ut) : [...utensils, ut]);
  }
  
  function addCondiment(cond) {
    setCondiments([...condiments, cond]);
  }
  
  function removeCondiment(idx) {
    setCondiments(condiments.filter((_, i) => i !== idx));
  }
  
  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ utensils, condiments, notes, deliveryNotes, qty });
  }
  
  const utensilCost = utensils.reduce((sum, ut) => sum + (utensilPrices[ut] || 0), 0);
  const total = (qty * food.price) + utensilCost;
  
  return (
    <div style={{ maxWidth: 520, margin: '2rem auto', background: '#fff', borderRadius: 24, boxShadow: '0 4px 32px #0002', padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <img src={food.img || 'https://via.placeholder.com/180?text=No+Image'} alt={food.name} style={{ width: 180, height: 180, objectFit: 'cover', borderRadius: 16, marginBottom: 18, boxShadow: '0 2px 12px #0001' }} />
      <div style={{ fontWeight: 700, fontSize: 30, marginBottom: 8, color: '#1a2236', letterSpacing: 1 }}>{food.name}</div>
      <div style={{ color: '#555', marginBottom: 12, fontSize: 18 }}>{food.desc}</div>
      <div style={{ fontWeight: 600, color: '#ffb300', fontSize: 22, marginBottom: 6 }}>Ksh {food.price}</div>
      <span style={{ color: '#f39c12', fontWeight: 600, fontSize: 17, marginBottom: 18 }}>Rating: {food.rating} ★</span>
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        {availableUtensils.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: '#1a2236' }}>Utensils Needed:</div>
            <div style={{ display: 'flex', gap: 18, marginBottom: 8, flexWrap: 'wrap' }}>
              {availableUtensils.map(ut => (
                <label key={ut} style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="checkbox" checked={utensils.includes(ut)} onChange={() => toggleUtensil(ut)} style={{ accentColor: '#ffb300', width: 18, height: 18 }} /> {ut}
                  {utensilPrices[ut] ? (
                    <span style={{ color: '#888', fontSize: 14, marginLeft: 4 }}>+{utensilPrices[ut]} Ksh</span>
                  ) : null}
                </label>
              ))}
            </div>
            {utensils.length > 0 && (
              <div style={{ color: '#1a2236', fontWeight: 500, fontSize: 15, marginTop: 6 }}>
                Utensil cost: <span style={{ color: '#ffb300', fontWeight: 700 }}>{utensilCost} Ksh</span>
              </div>
            )}
          </div>
        )}
        {availableCondiments.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: '#1a2236' }}>Condiments:</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
              {availableCondiments.map(cond => (
                <button type="button" key={cond} onClick={() => addCondiment(cond)} style={{ background: '#f7f7fa', color: '#222', border: '1px solid #ddd', borderRadius: 8, padding: '6px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 16, boxShadow: '0 1px 4px #0001' }}>{cond} +</button>
              ))}
            </div>
            <ul style={{ marginTop: 12, paddingLeft: 18 }}>
              {condiments.map((cond, idx) => (
                <li key={idx} style={{ color: '#555', fontSize: 15, marginBottom: 6 }}>
                  {cond} <button type="button" onClick={() => removeCondiment(idx)} style={{ marginLeft: 8, background: '#ffb300', color: '#222', border: 'none', borderRadius: 6, padding: '2px 8px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Remove</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#1a2236' }}>Additional Notes:</div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ width: '100%', minHeight: 60, borderRadius: 10, border: '1px solid #ccc', fontSize: 16, padding: 10, background: '#f7f7fa', marginTop: 4 }} placeholder="Any special instructions?" />
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#1a2236' }}>Delivery Instructions (for courier):</div>
          <textarea value={deliveryNotes} onChange={e => setDeliveryNotes(e.target.value)} style={{ width: '100%', minHeight: 60, borderRadius: 10, border: '1px solid #ccc', fontSize: 16, padding: 10, background: '#f7f7fa', marginTop: 4 }} placeholder="e.g., Call on arrival, gate code, landmarks" />
        </div>
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ fontWeight: 600, color: '#1a2236' }}>Quantity:</div>
          <button type="button" onClick={() => setQty(qty > 1 ? qty - 1 : 1)} style={{ background: '#e0e0e0', color: '#222', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 20, boxShadow: '0 1px 4px #0001' }}>-</button>
          <span style={{ margin: '0 12px', fontWeight: 700, fontSize: 20 }}>{qty}</span>
          <button type="button" onClick={() => setQty(qty + 1)} style={{ background: '#e0e0e0', color: '#222', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, cursor: 'pointer', fontSize: 20, boxShadow: '0 1px 4px #0001' }}>+</button>
        </div>
        <button type="submit" style={{ background: '#1a2236', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 28px', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginTop: 8, boxShadow: '0 2px 8px #0002', width: '100%' }}>
          {`Add to Cart (${qty}) ${total.toLocaleString()} Kshs`}
        </button>
      </form>
    </div>
  );
}

function CartPage({ cart, setCart, setPage, config }) {
    // Checkout popup state removed. Dedicated page is used.
  const [editingIdx, setEditingIdx] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteIdx, setDeleteIdx] = useState(null);
  const utensilPrices = { Spoon: 20, Plate: 50, Cup: 20 };
  const availableCondiments = Array.isArray(config?.condiments) ? config.condiments : [];
  function handleDelete(idx) {
    setDeleteIdx(idx);
  }
  function confirmDelete() {
    setCart(cart.filter((_, i) => i !== deleteIdx));
    setDeleteIdx(null);
  }
  function cancelDelete() {
    setDeleteIdx(null);
  }
  function handleEdit(idx) {
    setEditingIdx(idx);
    setEditItem({ ...cart[idx] });
  }
  function handleEditChange(field, value) {
    setEditItem({ ...editItem, [field]: value });
  }
  function toggleUtensil(ut) {
    setEditItem({ ...editItem, utensils: editItem.utensils.includes(ut) ? editItem.utensils.filter(u => u !== ut) : [...editItem.utensils, ut] });
  }
  function addCondiment(cond) {
    setEditItem({ ...editItem, condiments: [...editItem.condiments, cond] });
  }
  function removeCondiment(idx) {
    setEditItem({ ...editItem, condiments: editItem.condiments.filter((_, i) => i !== idx) });
  }
  function handleSaveEdit() {
    const utensilCost = editItem.utensils.reduce((sum, ut) => sum + (utensilPrices[ut] || 0), 0);
    const total = editItem.qty * editItem.price + utensilCost;
    setCart(cart.map((item, idx) => idx === editingIdx ? { ...editItem, utensilCost, total } : item));
    setEditingIdx(null);
    setEditItem(null);
  }
  return (
    <div>
      <h2 style={{ color: '#1a2236', marginBottom: 18 }}>Cart</h2>
      {cart.length === 0 ? (
        <div style={{ color: '#888', fontSize: 18 }}>Cart is empty.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {cart.map((item, idx) => (
            <li key={idx} style={{ marginBottom: 14, display: 'flex', alignItems: 'center', background: '#f7f7fa', borderRadius: 10, padding: '12px 14px', boxShadow: '0 1px 6px #0001' }}>
              <span style={{ fontWeight: 700, fontSize: 18, color: '#ffb300', marginRight: 16 }}>{idx + 1}.</span>
              <img src={item.img || 'https://via.placeholder.com/40?text=No+Image'} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 10, marginRight: 16 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                  <div style={{ color: '#888', fontSize: 14 }}>Delivery: {item.deliveryNotes}</div>
                )}
              </div>
              <button onClick={() => handleEdit(idx)} style={{ marginLeft: 12, background: '#ffb300', color: '#222', border: 'none', borderRadius: 8, padding: '6px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>Edit</button>
              <button onClick={() => handleDelete(idx)} style={{ marginLeft: 8, background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>Delete</button>
            </li>
          ))}
        </ul>
      )}
      {editingIdx !== null && editItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(26,34,54,0.55)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(2px)',
          overflow: 'hidden',
          pointerEvents: 'auto',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 24,
            padding: '2.5rem',
            maxWidth: 420,
            width: '90vw',
            boxShadow: '0 8px 32px #1a223633',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 'auto',
            border: '2px solid #ffb300',
            animation: 'popin 0.25s',
            overflow: 'visible',
            position: 'absolute',
            top: '50%',
            left: 'calc(50% - 6cm)',
            transform: 'translate(-50%, -50%)',
          }}>
            <h3 style={{ marginTop: 0, fontSize: 24, fontWeight: 700, color: '#1a2236', marginBottom: 18 }}>Edit Item</h3>
            <div style={{ width: '100%', marginBottom: 16 }}>
              <label style={{ fontWeight: 600, color: '#1a2236', fontSize: 18 }}>Quantity:</label>
              <input type="number" min={1} value={editItem.qty} onChange={e => handleEditChange('qty', Number(e.target.value))} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', fontSize: 16, marginTop: 6 }} />
            </div>
            <div style={{ width: '100%', marginBottom: 16 }}>
              <label style={{ fontWeight: 600, color: '#1a2236', fontSize: 18 }}>Notes:</label>
              <textarea value={editItem.notes || ''} onChange={e => handleEditChange('notes', e.target.value)} style={{ width: '100%', minHeight: 60, borderRadius: 8, border: '1px solid #ccc', fontSize: 16, padding: 10, marginTop: 6 }} />
            </div>
            <div style={{ width: '100%', marginBottom: 16 }}>
              <label style={{ fontWeight: 600, color: '#1a2236', fontSize: 18 }}>Utensils:</label>
              <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                {['Spoon', 'Plate', 'Cup'].map(ut => (
                  <label key={ut} style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="checkbox" checked={editItem.utensils && editItem.utensils.includes(ut)} onChange={() => toggleUtensil(ut)} style={{ accentColor: '#ffb300', width: 18, height: 18 }} /> {ut}
                  </label>
                ))}
              </div>
            </div>
            {availableCondiments.length > 0 && (
              <div style={{ width: '100%', marginBottom: 16 }}>
                <label style={{ fontWeight: 600, color: '#1a2236', fontSize: 18 }}>Condiments:</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
                  {availableCondiments.map(cond => (
                    <button type="button" key={cond} onClick={() => addCondiment(cond)} style={{ background: '#f7f7fa', color: '#222', border: '1px solid #ddd', borderRadius: 8, padding: '6px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 16, boxShadow: '0 1px 4px #0001' }}>{cond} +</button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 18, justifyContent: 'center', width: '100%', marginTop: 18 }}>
              <button onClick={handleSaveEdit} style={{ background: '#1a2236', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 32px', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px #0002', transition: 'background 0.2s' }}>Save</button>
              <button onClick={() => { setEditingIdx(null); setEditItem(null); }} style={{ background: '#e0e0e0', color: '#222', border: 'none', borderRadius: 10, padding: '12px 32px', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px #0001', transition: 'background 0.2s' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {deleteIdx !== null && (
        <>
          <style>{`
            body.modal-open {
              overflow: hidden !important;
            }
          `}</style>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(26,34,54,0.55)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(2px)',
            overflow: 'hidden',
            pointerEvents: 'auto',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #fff 80%, #ffb300 100%)',
              borderRadius: 24,
              padding: '3rem 2.5rem',
              maxWidth: 420,
              width: '90vw',
              boxShadow: '0 8px 32px #1a223633',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              margin: 'auto',
              border: '2px solid #ffb300',
              animation: 'popin 0.25s',
              overflow: 'visible',
              position: 'absolute',
              top: '50%',
              left: 'calc(50% - 6.5cm)',
              transform: 'translate(-50%, -50%)',
            }}>
              <style>{`
                @keyframes popin {
                  0% { transform: scale(0.95); opacity: 0.7; }
                  100% { transform: scale(1); opacity: 1; }
                }
              `}</style>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#ffb300',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 18,
                boxShadow: '0 2px 8px #ffb30044',
              }}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="18" cy="18" r="18" fill="#fff" />
                  <path d="M12 24l12-12M24 24L12 12" stroke="#e74c3c" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <h3 style={{ marginTop: 0, fontSize: 26, fontWeight: 700, color: '#1a2236', marginBottom: 10, letterSpacing: 1 }}>Remove Item?</h3>
              <p style={{ fontSize: 18, color: '#555', marginBottom: 22, textAlign: 'center', maxWidth: 320 }}>Are you sure you want to remove this item from your cart? This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: 18, justifyContent: 'center', width: '100%' }}>
                <button onClick={cancelDelete} style={{ background: '#e0e0e0', color: '#222', border: 'none', borderRadius: 12, padding: '12px 32px', fontWeight: 700, cursor: 'pointer', fontSize: 18, boxShadow: '0 2px 8px #0001', transition: 'background 0.2s' }}>Cancel</button>
                <button onClick={confirmDelete} style={{ background: 'linear-gradient(90deg, #e74c3c 80%, #ffb300 100%)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 32px', fontWeight: 700, cursor: 'pointer', fontSize: 18, boxShadow: '0 2px 8px #e74c3c33', transition: 'background 0.2s' }}>Delete</button>
              </div>
            </div>
          </div>
        </>
      )}
      {cart.length > 0 && (
        <div style={{ marginTop: 24, padding: '18px', background: '#f7f7fa', borderRadius: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 12 }}>Order Summary</div>
          <div style={{ fontWeight: 700, fontSize: 20, color: '#ffb300' }}>Grand Total: {cart.reduce((sum, item) => sum + item.total, 0)} Ksh</div>
          <button
            style={{ marginTop: 18, background: '#1a2236', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 28px', fontWeight: 700, fontSize: 18, cursor: 'pointer', width: '100%' }}
            onClick={() => setPage('checkout')}
          >Checkout</button>
        </div>
      )}
      {/* Checkout popup/modal removed. Checkout is now a dedicated page. */}
    </div>
  );
}

function CheckoutPage({ cart, setPage, checkoutPayment, setCheckoutPayment, onCheckoutComplete, profile, userEmail }) {
  const [deliveryType, setDeliveryType] = React.useState('');
  const [cardDetails, setCardDetails] = React.useState({ number: '', name: '', expiry: '', cvv: '' });
  const [processing, setProcessing] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [mpesaStatus, setMpesaStatus] = React.useState('');
  const [mpesaNumber, setMpesaNumber] = React.useState('');
  const [mpesaPushed, setMpesaPushed] = React.useState(false);

  const baseTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const deliveryFee = deliveryType === 'Delivery' ? 50 : 0;
  const grandTotal = baseTotal + deliveryFee;

  function handleCardInput(e) {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  }

  function isValidMpesaNumber(num) {
    return (/^(07\d{8}|011\d{7})$/).test(num);
  }

  async function handleMpesaPush() {
    setErrorMsg('');
    setMpesaStatus('Initiating M-Pesa payment...');
    setProcessing(true);
    try {
      let phone = mpesaNumber;
      if (phone.startsWith('0')) phone = '254' + phone.slice(1);
      const res = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: grandTotal, phone }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || data.error);
      setMpesaStatus('STK Push sent. Enter your M-Pesa PIN.');
      setMpesaPushed(true);
      setProcessing(false);
    } catch (err) {
      setErrorMsg('M-Pesa error: ' + err.message);
      setProcessing(false);
      setMpesaStatus('');
    }
  }

  async function handlePlaceOrder() {
    setErrorMsg('');
    if (cart.length === 0) { setErrorMsg('Cart is empty.'); return; }
    if (!deliveryType) { setErrorMsg('Please select Pickup or Delivery.'); return; }
    if (checkoutPayment === 'M-Pesa' && !mpesaPushed) { setErrorMsg('Please push M-Pesa first.'); return; }
    setProcessing(true);

    const payload = {
      items: cart.map(item => ({ menuItem: item.id, quantity: item.qty })),
      clientEmail: (profile?.email || userEmail || ''),
      clientName: (profile?.name && profile.name.trim()) ? profile.name.trim() : (profile?.email || userEmail || ''),
      clientPhone: profile?.phone || '',
      deliveryAddress: profile?.address || '',
      deliveryType,
      status: 'pending',
      total: grandTotal,
      paymentStatus: checkoutPayment === 'Card' ? 'paid' : 'pending'
    };

    try {
      const res = await fetch('/api/hotel/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to place order');
      setSuccessMsg(`Order placed! Grand Total: ${grandTotal} Ksh`);
      setProcessing(false);
      onCheckoutComplete && onCheckoutComplete(
        cart.map(item => ({ ...item })),
        deliveryType,
        grandTotal,
        data._id
      );
    } catch (err) {
      setErrorMsg(err.message);
      setProcessing(false);
    }
  }

  React.useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => { setPage('track'); }, 2200);
      return () => clearTimeout(t);
    }
  }, [successMsg, setPage]);

  return (
    <div style={{ maxWidth: 600, margin: '4rem auto', background: '#fff', borderRadius: 24, boxShadow: '0 6px 32px #0003', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 420 }}>
      <h2 style={{ color: '#1a2236', fontWeight: 700, fontSize: 34, marginBottom: 24, letterSpacing: 1 }}>Checkout</h2>
      {/* Delivery/Pickup selection mandatory */}
      <div style={{ width: '100%', marginBottom: 24 }}>
        <label style={{ fontWeight: 700, fontSize: 20, color: '#1a2236', marginBottom: 10 }}>Choose Delivery Type <span style={{ color: 'red' }}>*</span></label>
        <select value={deliveryType} onChange={e => setDeliveryType(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid #ccc', fontSize: 18, marginTop: 8, marginBottom: 8 }} required>
          <option value="">Select</option>
          <option value="Pickup">Pickup</option>
          <option value="Delivery">Delivery (+50 Ksh)</option>
        </select>
      </div>
      {successMsg ? (
        <div style={{ color: '#1a8f3c', fontWeight: 700, fontSize: 22, marginBottom: 18 }}>{successMsg}</div>
      ) : <>
        <div style={{ width: '100%', marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Order Items</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {cart.map((item, idx) => (
              <li key={idx} style={{ marginBottom: 18, display: 'flex', alignItems: 'center', background: '#f7f7fa', borderRadius: 12, padding: '14px 18px', boxShadow: '0 1px 8px #0001' }}>
                <img src={item.img || 'https://via.placeholder.com/48?text=No+Image'} alt={item.name} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 12, marginRight: 18 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 20, color: '#1a2236' }}>{item.name}</div>
                  <div style={{ color: '#555', fontSize: 16 }}>Qty: {item.qty}</div>
                  {item.offerActive && item.offerPercent > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <div style={{ fontWeight: 700, color: '#ff5252', fontSize: 18, marginTop: 2 }}>{item.total} Ksh</div>
                      <div style={{ color: '#888', textDecoration: 'line-through' }}>Ksh {(item.price * item.qty).toLocaleString()}</div>
                      <span style={{ background: '#ffb300', color: '#222', borderRadius: 6, padding: '2px 8px', fontWeight: 700, fontSize: 12 }}>-{item.offerPercent}%</span>
                    </div>
                  ) : (
                    <div style={{ fontWeight: 700, color: '#ffb300', fontSize: 18, marginTop: 2 }}>{item.total} Ksh</div>
                  )}
                  {item.deliveryNotes && (
                    <div style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Delivery: {item.deliveryNotes}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ width: '100%', marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 22 }}>Grand Total</div>
          <div style={{ fontWeight: 700, fontSize: 28, color: '#ffb300', marginTop: 8 }}>{grandTotal} Ksh</div>
          {deliveryType === 'Delivery' && (
            <div style={{ color: '#888', fontSize: 16, marginTop: 4 }}>Includes 50 Ksh delivery fee</div>
          )}
        </div>
        <div style={{ width: '100%', marginBottom: 24 }}>
          <label style={{ fontWeight: 700, fontSize: 20, color: '#1a2236', marginBottom: 10 }}>Payment Method</label>
          <select value={checkoutPayment} onChange={e => setCheckoutPayment(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid #ccc', fontSize: 18, marginTop: 8, marginBottom: 8 }}>
            <option value="Cash">Cash</option>
            <option value="M-Pesa">M-Pesa</option>
            <option value="Card">Card</option>
          </select>
        </div>
        {checkoutPayment === 'M-Pesa' && (
          <div style={{ width: '100%', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="tel"
              placeholder="M-Pesa Number (07XXXXXXXX or 011XXXXXXX)"
              value={mpesaNumber}
              onChange={e => {
                setMpesaNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10));
                setMpesaPushed(false);
              }}
              style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #ccc', fontSize: 18 }}
              disabled={processing}
              maxLength={10}
            />
            <button
              style={{ background: isValidMpesaNumber(mpesaNumber) && !processing ? '#1a2236' : '#ccc', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 18px', fontWeight: 700, fontSize: 18, cursor: isValidMpesaNumber(mpesaNumber) && !processing ? 'pointer' : 'not-allowed' }}
              onClick={handleMpesaPush}
              disabled={!isValidMpesaNumber(mpesaNumber) || processing || mpesaPushed}
            >Push</button>
          </div>
        )}
        {mpesaStatus && <div style={{ color: '#1a2236', fontWeight: 600, marginBottom: 12 }}>{mpesaStatus}</div>}
        {errorMsg && <div style={{ color: '#e74c3c', fontWeight: 600, marginBottom: 12 }}>{errorMsg}</div>}
        <button
          style={{ background: processing || !deliveryType ? '#ccc' : '#1a2236', color: '#fff', border: 'none', borderRadius: 12, padding: '16px 32px', fontWeight: 700, fontSize: 22, cursor: processing || !deliveryType ? 'not-allowed' : 'pointer', width: '100%', marginBottom: 12, boxShadow: '0 2px 8px #0002' }}
          onClick={handlePlaceOrder}
          disabled={processing || !deliveryType || (checkoutPayment === 'M-Pesa' && !mpesaPushed) || (checkoutPayment === 'Card' && !isValidCard(cardDetails))}
        >{processing ? 'Processing...' : 'Checkout'}</button>
        <button onClick={() => setPage('cart')} style={{ background: '#e0e0e0', color: '#222', border: 'none', borderRadius: 12, padding: '12px 28px', fontWeight: 700, fontSize: 18, cursor: processing ? 'not-allowed' : 'pointer', width: '100%' }} disabled={processing}>Back to Cart</button>
      </>}
    </div>
  );
}


export default App;
