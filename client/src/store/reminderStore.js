import { create } from 'zustand';

const useReminderStore = create((set, get) => ({
  reminders: [],
  pagination: null,
  stats: null,
  filter: 'all',
  search: '',
  sort: 'remindAt',
  viewMode: 'grid', // 'grid' | 'list'
  loading: false,
  error: null,
  selectedIds: [],

  setReminders: (reminders, pagination) => set({ reminders, pagination }),
  setStats: (stats) => set({ stats }),
  setFilter: (filter) => set({ filter }),
  setSearch: (search) => set({ search }),
  setSort: (sort) => set({ sort }),
  setViewMode: (viewMode) => set({ viewMode }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addReminder: (reminder) =>
    set((state) => ({ reminders: [reminder, ...state.reminders] })),

  updateReminder: (id, updates) =>
    set((state) => ({
      reminders: state.reminders.map((r) => (r._id === id ? { ...r, ...updates } : r)),
    })),

  removeReminder: (id) =>
    set((state) => ({ reminders: state.reminders.filter((r) => r._id !== id) })),

  toggleSelect: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((i) => i !== id)
        : [...state.selectedIds, id],
    })),

  clearSelection: () => set({ selectedIds: [] }),

  // Optimistic snooze
  snoozeReminder: (id, snoozeUntil) =>
    set((state) => ({
      reminders: state.reminders.map((r) =>
        r._id === id ? { ...r, snoozeUntil } : r
      ),
    })),
}));

export default useReminderStore;
