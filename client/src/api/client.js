// API Client Module with Fetch

const API_BASE = '/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    ...options.headers
  };

  // Attach token if present and not already provided
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle json payload
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: 'Invalid server response'
  }));

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Authentication API
export const authAPI = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
  getMe: () => request('/auth/me'),
  getDemoAccounts: () => request('/auth/demo-accounts')
};

// Vouchers API
export const voucherAPI = {
  getVouchers: (params = {}) => {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== '' && v !== null)
    ).toString();
    return request(`/vouchers${queryString ? `?${queryString}` : ''}`);
  },
  getVoucherById: (id) => request(`/vouchers/${id}`),
  createVoucher: (data) => request('/vouchers', { method: 'POST', body: data }),
  updateVoucher: (id, data) => request(`/vouchers/${id}`, { method: 'PUT', body: data }),
  deleteVoucher: (id) => request(`/vouchers/${id}`, { method: 'DELETE' }),
  submitVoucher: (id, data = {}) => request(`/vouchers/${id}/submit`, { method: 'POST', body: data }),
  approveVoucher: (id, data) => request(`/vouchers/${id}/approve`, { method: 'POST', body: data }),
  rejectVoucher: (id, data) => request(`/vouchers/${id}/reject`, { method: 'POST', body: data })
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => request('/dashboard/stats')
};

// File Upload API
export const uploadAPI = {
  uploadSignature: async (file) => {
    const formData = new FormData();
    formData.append('signature', file);
    return request('/upload/signature', {
      method: 'POST',
      body: formData
    });
  }
};
