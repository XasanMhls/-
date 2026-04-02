import api from './api.js';

export const adminService = {
  getStats: () => api.get('/admin/stats').then(r => r.data),
  getUsers: (params) => api.get('/admin/users', { params }).then(r => r.data),
  createUser: (data) => api.post('/admin/users', data).then(r => r.data),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data).then(r => r.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then(r => r.data),
  getReminders: (params) => api.get('/admin/reminders', { params }).then(r => r.data),
  deleteReminder: (id) => api.delete(`/admin/reminders/${id}`).then(r => r.data),
};
