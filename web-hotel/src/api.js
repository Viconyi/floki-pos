
const jsonHeaders = { 'Content-Type': 'application/json' };

let authToken = null;
export function setAuthToken(token) { authToken = token || null; }
function getAuthToken() {
  try {
    if (authToken) return authToken;
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('staffToken');
    }
    return null;
  } catch {
    return authToken;
  }
}

let errorHandler = null;
export function setApiErrorHandler(fn) { errorHandler = fn; }

const API_BASE = process.env.REACT_APP_API_BASE || window.location.origin;

function resolveUrl(url) {
  if (/^https?:\/\//i.test(url)) return url;
  if (!API_BASE) return url;
  if (url.startsWith('/')) return API_BASE + url;
  return API_BASE + '/' + url;
}

async function http(method, url, body) {
  try {
    const headers = body ? { ...jsonHeaders } : {};
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(resolveUrl(url), {
      method,
      headers: Object.keys(headers).length ? headers : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      const err = new Error(text || `HTTP ${res.status}`);
      if (errorHandler) errorHandler(err, { url, status: res.status });
      throw err;
    }
    if (errorHandler) errorHandler(null, { url, status: res.status });
    // 204 no content
    if (res.status === 204) return null;
    return res.json();
  } catch (e) {
    if (errorHandler) errorHandler(e, { url });
    throw e;
  }
}


export const HotelAPI = {
  // Orders
  listOrders: () => http('GET', '/api/hotel/orders'),
  updateOrder: (id, payload) => http('PUT', `/api/hotel/orders/${id}`, payload),
  createOrder: (payload) => http('POST', '/api/hotel/orders', payload),

  // Menu (admin endpoints)
  listMenu: () => http('GET', '/api/admin/menu'),
  createMenuItem: (payload) => http('POST', '/api/admin/menu', payload),
  updateMenuItem: (id, payload) => http('PUT', `/api/admin/menu/${id}`, payload),
  deleteMenuItem: (id) => http('DELETE', `/api/admin/menu/${id}`),

  // Auth
  login: (username, pin) => http('POST', '/api/hotel/auth/login', { username, pin }),
  logout: () => http('POST', '/api/hotel/auth/logout'),

  // MPESA QR
  generateQR: (payload) => http('POST', '/api/mpesa/qrcode', payload),

  // Reviews
  listReviews: () => http('GET', '/api/hotel/reviews'),

  // ETR generation
  generateETR: (orderId) => fetch(`/api/hotel/etr/${orderId}`).then(res => res.ok ? res.text() : Promise.reject('Failed to generate ETR')),
  generateBulkETR: (orderIds) => fetch(`/api/hotel/etr/bulk`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderIds }) }).then(res => res.ok ? res.json() : Promise.reject('Failed to generate bulk ETR')),
};

export function formatCurrency(amount) {
  if (typeof amount !== 'number') return amount;
  // Use Kenyan Shillings display as "Kshs" per requirements
  const num = Number.isFinite(amount) ? amount : 0;
  return `Kshs ${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatDateTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}
