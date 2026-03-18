const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('sansnom_token');
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Erreur serveur.');
  }

  return data;
}

// Auth
export const authAPI = {
  createAnonymous: () => request('/auth/anon', { method: 'POST' }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),
};

// Posts
export const postsAPI = {
  getAll: (theme) => request(`/posts${theme && theme !== 'all' ? `?theme=${theme}` : ''}`),
  getById: (id) => request(`/posts/${id}`),
  create: (data) => request('/posts', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
  toggleLike: (id) => request(`/posts/${id}/like`, { method: 'POST' }),
};

// Comments
export const commentsAPI = {
  add: (postId, content) =>
    request(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
  delete: (commentId) => request(`/comments/${commentId}`, { method: 'DELETE' }),
};

// Volunteers
export const volunteersAPI = {
  getAll: () => request('/volunteers'),
  getMyProfile: () => request('/volunteers/me'),
  register: (data) => request('/volunteers/register', { method: 'POST', body: JSON.stringify(data) }),
  updateProfile: (data) => request('/volunteers/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  updateStatus: (status) =>
    request('/volunteers/status', { method: 'PATCH', body: JSON.stringify({ status }) }),
};

// Reports
export const reportsAPI = {
  create: (data) => request('/reports', { method: 'POST', body: JSON.stringify(data) }),
  getAll: (status) => request(`/reports?status=${status || 'pending'}`),
  resolve: (id, action) =>
    request(`/reports/${id}`, { method: 'PATCH', body: JSON.stringify({ action }) }),
};

// Admin
export const adminAPI = {
  getStats: () => request('/admin/stats'),
  getReports: (status) => request(`/admin/reports?status=${status || 'pending'}`),
  resolveReport: (id, action) => request(`/admin/reports/${id}`, { method: 'PATCH', body: JSON.stringify({ action }) }),
  getPosts: (hidden) => request(`/admin/posts?hidden=${hidden || 'false'}`),
  togglePostVisibility: (id) => request(`/admin/posts/${id}/visibility`, { method: 'PATCH' }),
  getUsers: (search) => request(`/admin/users?search=${search || ''}`),
  updateUser: (id, data) => request(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getVolunteers: () => request('/admin/volunteers'),
};
// Resources
export const resourcesAPI = {
  getAll: () => request('/resources'),
  create: (data) => request('/resources', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => request(`/resources/${id}`, { method: 'DELETE' }),
};


// Chat rooms
export const chatAPI = {
  getOrCreateRoom: () => request('/chat/room', { method: 'POST' }),
  getMessages: (roomId) => request(`/chat/room/${roomId}/messages`),
  getWaitingRooms: () => request('/chat/waiting'),
  getMyRooms: () => request('/chat/my-rooms'),
  acceptRoom: (roomId) => request(`/chat/room/${roomId}/accept`, { method: 'PATCH' }),
  closeRoom: (roomId) => request(`/chat/room/${roomId}/close`, { method: 'PATCH' }),
};