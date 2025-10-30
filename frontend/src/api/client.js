const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://mezgeb-3.vercel.app';

function getToken() {
  return localStorage.getItem('token');
}

export async function apiRequest(path, { method = 'GET', body, headers } = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const msg = isJson && data?.message ? data.message : res.statusText;
    throw new Error(msg || 'Request failed');
  }
  return data;
}

export const AuthAPI = {
  login: (payload) => apiRequest('/api/auth/login', { method: 'POST', body: payload }),
  register: (payload) => apiRequest('/api/auth/register', { method: 'POST', body: payload }),
  profile: () => apiRequest('/api/auth/profile'),
  updateDailyGoal: (payload) => apiRequest('/api/auth/daily-goal', { method: 'PUT', body: payload }),
};

export const ClientsAPI = {
  list: () => apiRequest('/api/clients'),
  get: (id) => apiRequest(`/api/clients/${id}`),
  create: (payload) => apiRequest('/api/clients', { method: 'POST', body: payload }),
  update: (id, payload) => apiRequest(`/api/clients/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => apiRequest(`/api/clients/${id}`, { method: 'DELETE' }),
  getStats: () => apiRequest('/api/clients/stats/addition'),
  getByPeriod: (period) => apiRequest(`/api/clients/by-period?period=${period}`),
  getByDate: (date) => apiRequest(`/api/clients/by-date?date=${date}`),
};

export const LeadsAPI = {
  list: () => apiRequest('/api/leads'),
  get: (id) => apiRequest(`/api/leads/${id}`),
  create: (payload) => apiRequest('/api/leads', { method: 'POST', body: payload }),
  update: (id, payload) => apiRequest(`/api/leads/${id}`, { method: 'PUT', body: payload }),
  remove: (id) => apiRequest(`/api/leads/${id}`, { method: 'DELETE' }),
};
