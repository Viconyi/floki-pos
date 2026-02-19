import React, { useState } from 'react';


const CLIENT_NAV = [
  { key: 'menu', label: 'Menu' },
  { key: 'order', label: 'Order Food' },
  { key: 'track', label: 'Track Delivery' },
  { key: 'offers', label: 'Offers' },
];
const HOTEL_NAV = [
  { key: 'menu', label: 'Menu' },
  { key: 'orders', label: 'Orders' },
  { key: 'track', label: 'Track Delivery' },
];
const ADMIN_NAV = [
  { key: 'admin', label: 'Admin Panel' },
];


function App() {
  // For demo: role can be 'client', 'hotel', or 'admin'
  const [role, setRole] = useState('client');
  const [page, setPage] = useState('menu');

  let nav = CLIENT_NAV;
  if (role === 'hotel') nav = HOTEL_NAV;
  if (role === 'admin') nav = ADMIN_NAV;

  return (
    <div style={{ fontFamily: 'Inter, Arial, sans-serif', background: '#f7f7fa', minHeight: '100vh' }}>
      <header style={{ background: '#1a2236', color: '#fff', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, fontSize: 28 }}>Floki's Hotel</span>
        <div>
          <select value={role} onChange={e => { setRole(e.target.value); setPage('menu'); }} style={{ marginRight: 18, padding: 6, borderRadius: 6 }}>
            <option value="client">Client</option>
            <option value="hotel">Hotel Staff</option>
            <option value="admin">Admin</option>
          </select>
          <nav style={{ display: 'inline' }}>
            {nav.map(n => (
              <button
                key={n.key}
                onClick={() => setPage(n.key)}
                style={{
                  background: page === n.key ? '#ffb300' : 'transparent',
                  color: page === n.key ? '#222' : '#fff',
                  border: 'none',
                  borderRadius: 6,
                  marginLeft: 16,
                  padding: '8px 18px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 16,
                  transition: 'background 0.2s',
                }}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main style={{ maxWidth: 700, margin: '2rem auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #0001', padding: '2rem' }}>
        {role === 'client' && (
          <>
            {page === 'menu' && <MenuPage />}
            {page === 'order' && <OrderPage />}
            {page === 'track' && <TrackPage />}
            {page === 'offers' && <OffersPage />}
          </>
        )}
        {role === 'hotel' && (
          <>
            {page === 'menu' && <MenuPage />}
            {page === 'orders' && <HotelOrdersPage />}
            {page === 'track' && <TrackPage />}
          </>
        )}
        {role === 'admin' && page === 'admin' && <AdminPage />}
      </main>
      <footer style={{ textAlign: 'center', color: '#888', padding: 24, fontSize: 15 }}>
        &copy; {new Date().getFullYear()} Floki's Hotel. All rights reserved.
      </footer>
    </div>
  );
}
function HotelOrdersPage() {
  return <>
    <h2 style={{ color: '#1a2236' }}>Hotel Orders</h2>
    <p>View and manage all incoming orders. (Hotel staff tools coming soon)</p>
    {/* TODO: Add hotel staff order management */}
  </>;
}

function MenuPage() {
  return <>
    <h2 style={{ color: '#1a2236' }}>Menu</h2>
    <p>Browse our delicious food and drinks. (Dynamic menu coming soon)</p>
    {/* TODO: Render menu items from backend */}
  </>;
}
function OrderPage() {
  return <>
    <h2 style={{ color: '#1a2236' }}>Order Food</h2>
    <p>Order your favorite meals. (Order form coming soon)</p>
    {/* TODO: Add order form and MPESA payment */}
  </>;
}
function TrackPage() {
  return <>
    <h2 style={{ color: '#1a2236' }}>Track Delivery</h2>
    <p>See your food delivery live on the map. (Tracking coming soon)</p>
    {/* TODO: Integrate Google Maps and live tracking */}
  </>;
}
function OffersPage() {
  return <>
    <h2 style={{ color: '#1a2236' }}>Offers</h2>
    <p>Check out our latest offers and discounts. (Offers coming soon)</p>
    {/* TODO: Render offers from backend */}
  </>;
}
function AdminPage() {
  return <>
    <h2 style={{ color: '#1a2236' }}>Admin Panel</h2>
    <p>Manage menu, prices, till, and send notifications. (Admin tools coming soon)</p>
    {/* TODO: Add admin controls */}
  </>;
}

export default App;
