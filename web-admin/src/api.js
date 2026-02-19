
const jsonHeaders = { 'Content-Type': 'application/json' };

function resolveUrl(url) {
  if (/^https?:\/\//i.test(url)) return url;
  const base = process.env.REACT_APP_API_BASE || 'http://localhost:5000';
  if (url.startsWith('/')) return base + url;
  return base + '/' + url;
}

let errorHandler = null;
export function setApiErrorHandler(fn) { errorHandler = fn; }

async function http(method, url, body) {
  try {
    const res = await fetch(resolveUrl(url), {
      method,
      headers: body ? jsonHeaders : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      const err = new Error(text || `HTTP ${res.status}`);
      if (errorHandler) errorHandler(err, { url, status: res.status });
      throw err;
    }
    if (errorHandler) errorHandler(null, { url, status: res.status });
    if (res.status === 204) return null;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      return res.json();
    } else {
      const text = await res.text();
      const err = new Error(text || 'Unexpected non-JSON response');
      if (errorHandler) errorHandler(err, { url, status: res.status });
      throw err;
    }
  } catch (e) {
    if (errorHandler) errorHandler(e, { url });
    throw e;
  }
}

export const AdminAPI = {
  // Staff
  listStaff: () => http('GET', '/api/admin/staff'),
  createStaff: (payload) => http('POST', '/api/admin/staff', payload),
  updateStaff: (id, payload) => http('PUT', `/api/admin/staff/${id}`, payload),
  deleteStaff: (id) => http('DELETE', `/api/admin/staff/${id}`),

  // Orders (from hotel endpoints)
  listOrders: () => http('GET', '/api/hotel/orders'),

  // Menu (available for future use)
  listMenu: () => http('GET', '/api/admin/menu'),
  createMenuItem: (payload) => http('POST', '/api/admin/menu', payload),
  updateMenuItem: (id, payload) => http('PUT', `/api/admin/menu/${id}`, payload),
  deleteMenuItem: (id) => http('DELETE', `/api/admin/menu/${id}`),

  // Till
  getTill: () => http('GET', '/api/admin/till'),
  updateTill: (payload) => http('PUT', '/api/admin/till', payload),

  // ETR generation endpoints
  generateETR: (orderId) => fetch(resolveUrl(`/api/hotel/etr/${orderId}`)).then(res => res.ok ? res.text() : Promise.reject('Failed to generate ETR')),
  generateBulkETR: (orderIds) => fetch(resolveUrl(`/api/hotel/etr/bulk`), { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ orderIds }) }).then(res => res.ok ? res.json() : Promise.reject('Failed to generate bulk ETR')),
};

export function formatDateTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

export function formatCurrency(amount) {
  const num = typeof amount === 'number' && Number.isFinite(amount) ? amount : Number(amount || 0);
  return `Kshs ${num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}