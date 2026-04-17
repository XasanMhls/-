import { create } from 'zustand';

const useSpeechStore = create((set) => ({
  speaking: false,
  paused: false,
  error: null,
  setState: (patch) => set((state) => ({ ...state, ...patch })),
  reset: () => set({ speaking: false, paused: false, error: null }),
}));

export default useSpeechStore;
