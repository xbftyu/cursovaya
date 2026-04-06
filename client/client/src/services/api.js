const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const fetchWithToken = async (endpoint, options = {}) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (userInfo && userInfo.token) {
    headers['Authorization'] = `Bearer ${userInfo.token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
      return;
    }
    const error = new Error(data.message || 'API request failed');
    error.response = { data, status: response.status };
    throw error;
  }

  return { data };
};

const apiService = {
  get: (endpoint) => fetchWithToken(endpoint, { method: 'GET' }),
  post: (endpoint, body) => fetchWithToken(endpoint, {
    method: 'POST',
    body: (body instanceof FormData) ? body : JSON.stringify(body)
  }),
  put: (endpoint, body) => fetchWithToken(endpoint, {
    method: 'PUT',
    body: (body instanceof FormData) ? body : JSON.stringify(body)
  }),
  delete: (endpoint) => fetchWithToken(endpoint, { method: 'DELETE' }),
};

export default apiService;
