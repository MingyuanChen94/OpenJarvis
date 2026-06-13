import { create } from 'zustand';

interface UIState {
  paletteOpen: boolean;
  shortcutsOpen: boolean;
  sidebarCollapsed: boolean;
  setPaletteOpen: (v: boolean) => void;
  setShortcutsOpen: (v: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
}

export const useUI = create<UIState>((set) => ({
  paletteOpen: false,
  shortcutsOpen: false,
  sidebarCollapsed: false,
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  setShortcutsOpen: (shortcutsOpen) => set({ shortcutsOpen }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
}));
