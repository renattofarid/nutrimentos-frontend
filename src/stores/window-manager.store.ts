import { create } from "zustand";

export interface WindowTab {
  id: string;
  initialPath: string; // path con el que se abrió (para deduplicar)
  path: string;        // path actual (se actualiza con la navegación interna)
  title: string;
}

interface WindowManagerStore {
  tabs: WindowTab[];
  activeTabId: string | null;
  openTab: (path: string, title: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabPath: (id: string, path: string) => void;
}

export const useWindowManager = create<WindowManagerStore>((set, get) => ({
  tabs: [],
  activeTabId: null,

  openTab: (path, title) => {
    const { tabs } = get();
    const existing = tabs.find((t) => t.initialPath === path);
    if (existing) {
      set({ activeTabId: existing.id });
      return;
    }
    const id = String(Date.now());
    set((state) => ({
      tabs: [...state.tabs, { id, initialPath: path, path, title }],
      activeTabId: id,
    }));
  },

  closeTab: (id) => {
    const { tabs, activeTabId } = get();
    const newTabs = tabs.filter((t) => t.id !== id);
    let newActiveId = activeTabId;
    if (activeTabId === id) {
      const idx = tabs.findIndex((t) => t.id === id);
      const next = newTabs[idx] ?? newTabs[idx - 1];
      newActiveId = next?.id ?? null;
    }
    set({ tabs: newTabs, activeTabId: newActiveId });
  },

  setActiveTab: (id) => {
    set({ activeTabId: id });
  },

  updateTabPath: (id, path) => {
    set((state) => ({
      tabs: state.tabs.map((t) => (t.id === id ? { ...t, path } : t)),
    }));
  },
}));
