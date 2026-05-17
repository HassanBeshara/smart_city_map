import { API_URL } from './constants';

const getToken = () => localStorage.getItem('token');

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),

  getMarkers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/markers?${q}`);
  },
  getMarker: (id) => request(`/markers/${id}`),
  createMarker: (body) => request('/markers', { method: 'POST', body: JSON.stringify(body) }),
  updateMarker: (id, body) => request(`/markers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteMarker: (id) => request(`/markers/${id}`, { method: 'DELETE' }),
  getNearest: (params) => {
    const q = new URLSearchParams(params).toString();
    return request(`/markers/nearest?${q}`);
  },
  getHeatmap: () => request('/markers/heatmap'),
  toggleFavorite: (id) => request(`/markers/${id}/favorite`, { method: 'POST' }),
  getFavorites: () => request('/markers/user/favorites'),
  getMyMarkers: () => request('/markers/user/mine'),

  getAdminStats: () => request('/admin/stats'),
  getAdminUsers: () => request('/admin/users'),
  getAdminMarkers: (params) => {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/markers?${q}`);
  },
  updateUserRole: (id, role) =>
    request(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  updateMarkerStatus: (id, status) =>
    request(`/admin/markers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};
