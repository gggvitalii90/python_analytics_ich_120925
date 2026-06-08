import { create } from 'zustand';

const initialFilters = {
  dateFrom: '2024-01-01',
  dateTo: '2026-05-31',
  types: [],
  paymentTypes: [],
  banks: [],
  objects: [],
  projects: [],
  budgetItems: [],
  responsible: [],
};

export const useFilterStore = create((set, get) => ({
  ...initialFilters,
  activeChips: {},        // dimension -> value (from chart clicks)
  sidebarOpen: true,

  setFilter: (key, value) => set({ [key]: value }),

  toggleChip: (dimension, value) => {
    const chips = get().activeChips;
    const cur = chips[dimension];
    if (cur === value) {
      const next = { ...chips };
      delete next[dimension];
      set({ activeChips: next });
    } else {
      set({ activeChips: { ...chips, [dimension]: value } });
    }
  },

  removeChip: (dimension) => {
    const chips = { ...get().activeChips };
    delete chips[dimension];
    set({ activeChips: chips });
  },

  resetAll: () => set({ ...initialFilters, activeChips: {}, sidebarOpen: get().sidebarOpen }),

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
