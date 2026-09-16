const API_BASE = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://127.0.0.1:8080/api');

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || 'The request could not be completed.');
  }
  return payload;
}

export const portfolioApi = {
  getContent: () => request('/content'),
  loginWithGoogle: (credential) => request('/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),
  getSession: (token) => request('/auth/session', { headers: { Authorization: `Bearer ${token}` } }),
  saveContent: (content, token) => request('/content', {
    method: 'PUT',
    body: JSON.stringify(content),
    headers: { Authorization: `Bearer ${token}` },
  }),
  logout: (token) => request('/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
};
