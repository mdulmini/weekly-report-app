const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Thin fetch wrapper that attaches the JWT (if present) and normalizes
 * error handling so components can just `await api(...)` and catch.
 */
async function api(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.message || data.errors?.[0]?.msg || 'Something went wrong';
    throw new Error(message);
  }

  return data;
}

// --- Auth ---
export const registerUser = (payload) => api('/auth/register', { method: 'POST', body: payload });
export const loginUser = (payload) => api('/auth/login', { method: 'POST', body: payload });
export const getMe = (token) => api('/auth/me', { token });
export const getTeamMembers = (token) => api('/auth/members', { token });

// --- Projects ---
export const getProjects = (token) => api('/projects', { token });

// --- Reports ---
export const getMyReports = (token, query = '') => api(`/reports/me${query}`, { token });
export const createReport = (token, payload) =>
  api('/reports', { method: 'POST', body: payload, token });
export const updateReport = (token, id, payload) =>
  api(`/reports/${id}`, { method: 'PUT', body: payload, token });
export const submitReport = (token, id) =>
  api(`/reports/${id}/submit`, { method: 'PATCH', token });
export const deleteReport = (token, id) => api(`/reports/${id}`, { method: 'DELETE', token });

// --- Manager ---
export const getTeamReports = (token, query = '') => api(`/reports/team${query}`, { token });
export const getSubmissionStatus = (token, weekStartDate) =>
  api(`/reports/team/status?weekStartDate=${weekStartDate}`, { token });

export default api;