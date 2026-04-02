import api from './api.js';

export const reminderService = {
  async getReminders(params = {}) {
    const res = await api.get('/reminders', { params });
    return res.data;
  },

  async getActiveReminders() {
    const res = await api.get('/reminders/active');
    return res.data;
  },

  async getStats() {
    const res = await api.get('/reminders/stats');
    return res.data;
  },

  async getById(id) {
    const res = await api.get(`/reminders/${id}`);
    return res.data;
  },

  async create(data) {
    const res = await api.post('/reminders', data);
    return res.data;
  },

  async update(id, data) {
    const res = await api.patch(`/reminders/${id}`, data);
    return res.data;
  },

  async delete(id) {
    const res = await api.delete(`/reminders/${id}`);
    return res.data;
  },

  async snooze(id, minutes) {
    const res = await api.post(`/reminders/${id}/snooze`, { minutes });
    return res.data;
  },

  async recordTrigger(id) {
    const res = await api.post(`/reminders/${id}/trigger`);
    return res.data;
  },

  async bulkDelete(ids) {
    const res = await api.post('/reminders/bulk-delete', { ids });
    return res.data;
  },

  async exportAll() {
    const res = await api.get('/reminders/export');
    return res.data;
  },

  async importAll(reminders) {
    const res = await api.post('/reminders/import', { reminders });
    return res.data;
  },
};
