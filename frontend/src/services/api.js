import { API_BASE_URL } from '../utils/config';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
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
      body: JSON.stringify(payload),
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
      body: JSON.stringify(payload),
    }),
  getWorkers: token =>
    request('/users/workers', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  getActiveWorkers: token =>
    request('/users/workers/active', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  getAdmins: token =>
    request('/users/admins', {
      headers: { Authorization: `Bearer ${token}` },
    }),
  createAdmin: (token, payload) =>
    request('/users/admins', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  updateAdmin: (token, adminId, payload) =>
    request(`/users/admins/${adminId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  createWorker: (token, payload) =>
    request('/users/workers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  updateWorker: (token, workerId, payload) =>
    request(`/users/workers/${workerId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    }),
  getWorkerRecord: (token, workerId) =>
    request(`/users/workers/${workerId}/record`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};
