import React, { useEffect, useState } from 'react';
import { HotelAPI } from '../api';


export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchReviews() {
      setLoading(true);
      setError('');
      try {
        const data = await HotelAPI.listReviews();
        setReviews(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message || 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 0' }}>
      <h2 style={{ color: '#1a2236', marginBottom: 24 }}>Customer Ratings & Reviews</h2>
      {loading && <div style={{ color: '#1a2236' }}>Loading reviews…</div>}
      {error && <div style={{ color: 'crimson', fontWeight: 600 }}>{error}</div>}
      {!loading && !error && reviews.length === 0 && (
        <div style={{ color: '#8a8fa3', fontSize: 16 }}>No reviews yet.</div>
      )}
      <div style={{ display: 'grid', gap: 24 }}>
        {reviews.map((r, i) => (
          <div key={r._id || i} style={{
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 2px 12px #0001',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            borderLeft: `6px solid ${getRatingColor(r.rating)}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <ItemImage item={r.menuItem} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ color: '#1a2236', fontWeight: 600, fontSize: 17 }}>{r.menuItem?.name || ''}</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: getRatingColor(r.rating) }}>{renderStars(r.rating)}</span>
              </div>
              <span style={{ color: '#8a8fa3', fontSize: 14, marginLeft: 'auto' }}>{formatDateTime(r.createdAt)}</span>
            </div>
            {r.comment && <div style={{ color: '#2d3a58', fontSize: 16 }}>{r.comment}</div>}
            <div style={{ color: '#8a8fa3', fontSize: 13 }}>
              {r.orderId?.clientName && <span>By {r.orderId.clientName}</span>}
              {r.orderId?._id && <span style={{ marginLeft: 8, color: '#b0b4c3' }}>Order #{String(r.orderId._id).slice(-6).toUpperCase()}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function ItemImage({ item }) {
  // Use item.image or item.photo if available, else fallback to a placeholder
  const src = item?.image || item?.photo || 'https://via.placeholder.com/64x64?text=No+Image';
  return (
    <img
      src={src}
      alt={item?.name || 'Menu Item'}
      style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, background: '#f0f0f0', marginRight: 8 }}
    />
  );
}

function renderStars(rating) {
  const n = Math.round(Number(rating) || 0);
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function getRatingColor(rating) {
  const n = Math.round(Number(rating) || 0);
  if (n >= 5) return '#1a8f3c';
  if (n >= 4) return '#4caf50';
  if (n >= 3) return '#ffb300';
  if (n >= 2) return '#ff7043';
  return '#e53935';
}

function formatDateTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}
