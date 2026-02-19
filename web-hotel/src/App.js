import React, { useEffect, useState } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import OrdersPage from './pages/OrdersPage';
import MenuPage from './pages/MenuPage';
import SalesPage from './pages/SalesPage';
import MakeSalePage from './pages/MakeSalePage';
import QRPage from './pages/QRPage';
import ReviewsPage from './pages/ReviewsPage';
import { setApiErrorHandler, HotelAPI, setAuthToken } from './api';

const navStyle = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
};

const linkStyle = ({ isActive }) => ({
  color: isActive ? '#fff' : '#c9d1e4',
  background: isActive ? '#2d3a58' : 'transparent',
  padding: '0.5rem 0.75rem',
  borderRadius: 8,
  textDecoration: 'none',
  fontWeight: 600,
  transition: 'background 120ms ease',
});

function Header({ pendingCount }) {
  const location = useLocation();
  const title = {
    '/': "Make Sale",
    '/orders': "Orders",
    '/menu': "Menu",
    '/sales': "Sales",
    '/settings': "Settings",
  }[location.pathname] || 'Staff';

  async function handleLogout() {
    try {
      await HotelAPI.logout();
    } catch {}
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem('staffToken');
    } catch {}
    // Emit a custom event for app-level auth state update
    window.dispatchEvent(new Event('staff-logged-out'));
  }

  return (
    <header style={{ background: '#1a2236', color: '#fff', padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontWeight: 700, fontSize: 20, opacity: 0.85 }}>FoodLoki</span>
      <span style={{ fontWeight: 800, fontSize: 22 }}>{`FoodLoki • ${title}`}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <nav style={navStyle}>
          <NavLink to="/" style={linkStyle} end>Make Sale</NavLink>
          <NavLink to="/orders" style={linkStyle}>Orders{pendingCount>0?` (${pendingCount})`:''}</NavLink>
          <NavLink to="/menu" style={linkStyle}>Menu</NavLink>
          <NavLink to="/sales" style={linkStyle}>Sales</NavLink>
          <NavLink to="/reviews" style={linkStyle}>Reviews</NavLink>
          <NavLink to="/qr" style={linkStyle}>QR Pay</NavLink>
          <NavLink to="/settings" style={linkStyle}>Settings</NavLink>
        </nav>
        <button onClick={handleLogout} title="Log out"
                style={{ background: '#ffb300', color: '#1a2236', fontWeight: 700, border: 'none', borderRadius: 8, padding: '0.5rem 0.75rem', cursor: 'pointer' }}>
          Log Out
        </button>
      </div>
    </header>
  );
}

function App() {
  const [apiDown, setApiDown] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const prevPendingRef = React.useRef(0);

  function notify(title, body) {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      }
    } catch {}
  }

  useEffect(() => {
    setApiErrorHandler((err, info) => {
      // Only show unreachable banner for network errors or 5xx
      const status = info && typeof info.status === 'number' ? info.status : null;
      setApiDown(!!err && (status == null || status >= 500));
    });
    // Initialize auth token if stored
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('staffToken') : null;
      if (token) {
        setAuthToken(token);
        setAuthed(true);
      }
    } catch {}

    function onLoggedOut() {
      setAuthToken(null);
      setAuthed(false);
    }
    window.addEventListener('staff-logged-out', onLoggedOut);
    try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission().catch(()=>{}); } catch {}
    return () => window.removeEventListener('staff-logged-out', onLoggedOut);
  }, []);

  async function handleLogin(e) {
    e && e.preventDefault();
    setAuthError('');
    try {
      const resp = await HotelAPI.login(username, pin);
      const token = resp && resp.token;
      if (!token) throw new Error('No token returned');
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('staffToken', token);
          const u = resp && resp.user ? resp.user : {};
          const fn = (u.firstName || '').trim();
          const ln = (u.lastName || '').trim();
          let display = '';
          if (fn) {
            display = fn + (ln ? ` ${ln.charAt(0)}.` : '');
          } else if ((u.name || '').trim()) {
            const parts = (u.name || '').trim().split(/\s+/);
            display = parts[0] + (parts[1] ? ` ${parts[1].charAt(0)}.` : '');
          } else if ((u.username || '').trim()) {
            display = u.username;
          } else {
            display = 'Staff';
          }
          localStorage.setItem('staffDisplayName', display);
        }
      } catch {}
      setAuthToken(token);
      setAuthed(true);
      setPin('');
    } catch (err) {
      setAuthError(err && err.message ? err.message : 'Login failed');
    }
  }

  if (!authed) {
    return (
      <div style={{ fontFamily: 'Inter, Arial, sans-serif', background: '#f7f7fa', minHeight: '100vh' }}>
        {apiDown && (
          <div style={{ background: '#fff4e5', color: '#8a5a00', borderBottom: '1px solid #ffd8a8', padding: '8px 12px', textAlign: 'center', fontSize: 14 }}>
            Backend unreachable. Please ensure the server is running on port 5000.
          </div>
        )}
        <header style={{ background: '#1a2236', color: '#fff', padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: 20, opacity: 0.85 }}>FoodLoki</span>
          <img src={process.env.PUBLIC_URL + '/FoodLoki.png'} alt="FoodLoki Logo" style={{ width: 80, margin: '0 auto 18px', display: 'block' }} />
          <span style={{ fontWeight: 800, fontSize: 22 }}>FoodLoki • Staff Login</span>
          <span />
        </header>
        <main style={{ maxWidth: 420, margin: '2rem auto', padding: '0 1rem' }}>
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #0001', padding: '1.25rem' }}>
            <form onSubmit={handleLogin} style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e1e4ee' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#6a708a' }}>PIN / Password</label>
                <input type="password" value={pin} onChange={e => setPin(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e1e4ee' }} />
              </div>
              {authError && <div style={{ color: 'crimson' }}>{authError}</div>}
              <button type="submit" style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#1a2236', color: '#fff' }}>Log In</button>
            </form>
          </div>
          <div style={{ textAlign: 'center', color: '#8a8fa3', padding: 16, fontSize: 13 }}>
            Tip: Use HStaff1 / Zwinger2026! or MStaff1 / Zanger2026!
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif', background: '#f7f7fa', minHeight: '100vh' }}>
      {apiDown && (
        <div style={{ background: '#fff4e5', color: '#8a5a00', borderBottom: '1px solid #ffd8a8', padding: '8px 12px', textAlign: 'center', fontSize: 14 }}>
          Backend unreachable. Please ensure the server is running on port 5000.
        </div>
      )}
      <Header pendingCount={pendingCount} />
      <main style={{ maxWidth: 1000, margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #0001', padding: '1.25rem' }}>
          <Routes>
            <Route path="/" element={<MakeSalePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/qr" element={<QRPage />} />
            <Route path="/settings" element={<HotelSettings />} />
          </Routes>
        </div>
      </main>
      <footer style={{ textAlign: 'center', color: '#8a8fa3', padding: 24, fontSize: 13 }}>
        © {new Date().getFullYear()} FoodLoki Staff<br />
        Contact: <a href="tel:+254759424562" style={{ color: '#888' }}>+254759424562</a>
      </footer>
    </div>
  );
}

export default App;

function HotelSettings() {
  const [condiments, setCondiments] = useState([]);
  const [utensils, setUtensils] = useState([]);
  const [condimentsText, setCondimentsText] = useState('');
  const [utensilsText, setUtensilsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/hotel/config')
      .then(res => res.ok ? res.json() : Promise.resolve({ utensils: [], condiments: [] }))
      .then(cfg => {
        setUtensils(Array.isArray(cfg.utensils) ? cfg.utensils : []);
        setCondiments(Array.isArray(cfg.condiments) ? cfg.condiments : []);
        setUtensilsText(Array.isArray(cfg.utensils) ? cfg.utensils.join('\n') : '');
        setCondimentsText(Array.isArray(cfg.condiments) ? cfg.condiments.join('\n') : '');
      })
      .catch(() => {});
  }, []);

  function parseLines(text) {
    return Array.from(new Set(text.split(/\r?\n/).map(s => s.trim()).filter(Boolean)));
  }

  async function save() {
    setSaving(true);
    setMsg('');
    try {
      const finalUtensils = parseLines(utensilsText);
      const finalCondiments = parseLines(condimentsText);
      const res = await fetch('/api/hotel/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ utensils: finalUtensils, condiments: finalCondiments }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Failed to save');
      setUtensils(finalUtensils);
      setCondiments(finalCondiments);
      setMsg('Saved');
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(''), 2500);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '1rem auto' }}>
      <h2 style={{ marginTop: 0, color: '#1a2236' }}>FoodLoki Settings</h2>
      <p style={{ color: '#6a708a' }}>Configure available utensils and condiments for client orders. Leave a list empty to hide it.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={{ fontWeight: 600, color: '#1a2236' }}>Utensils (one per line)</label>
          <textarea
            value={utensilsText}
            onChange={e => setUtensilsText(e.target.value)}
            style={{ width: '100%', minHeight: 160, border: '1px solid #e1e4ee', borderRadius: 8, padding: 10 }}
            placeholder={'e.g.\nSpoon\nPlate\nCup'}
          />
        </div>
        <div>
          <label style={{ fontWeight: 600, color: '#1a2236' }}>Condiments (one per line)</label>
          <textarea
            value={condimentsText}
            onChange={e => setCondimentsText(e.target.value)}
            style={{ width: '100%', minHeight: 160, border: '1px solid #e1e4ee', borderRadius: 8, padding: 10 }}
            placeholder={'e.g.\nKetchup\nMustard\nChili Sauce'}
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button onClick={save} disabled={saving} style={{ background: '#1a2236', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700 }}>
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
        {msg && <span style={{ color: msg === 'Saved' ? '#1a8f3c' : 'crimson', fontWeight: 600 }}>{msg}</span>}
      </div>
    </div>
  );
}
