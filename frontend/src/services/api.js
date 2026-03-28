import { API_BASE_URL } from '../utils/config';

function toFormData(payload) {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (
      (key === 'image' || key === 'proofImage') &&
      typeof value === 'string' &&
      value.startsWith('file:')
    ) {
      formData.append(key, {
        uri: value,
        name: `${key}.jpg`,
        type: 'image/jpeg',
      });
      return;
    }

    formData.append(key, value);
  });

  return formData;
}

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong while calling the API.');
  }

  return data;
}

export const api = {
  register: payload =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: payload =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getProfile: token =>
    request('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  getDashboard: token =>
    request('/dashboard/summary', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  getComplaints: (token, query = '') =>
    request(`/complaints${query}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  getComplaintById: (token, complaintId) =>
    request(`/complaints/${complaintId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
  createComplaint: (token, payload) =>
    request('/complaints', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: toFormData(payload),
    }),
  assignComplaint: (token, complaintId, payload) =>
    request(
      `/complaints/${complaintId}/assign?workerId=${encodeURIComponent(payload.workerId || '')}`,
      {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
      },
    ),
  updateComplaintStatus: (token, complaintId, payload) =>
    request(`/complaints/${complaintId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: toFormData(payload),
    }),
  getWorkers: token =>
    request('/users/workers', {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
