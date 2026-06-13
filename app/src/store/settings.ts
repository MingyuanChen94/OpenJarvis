import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';
export type DemoMode = 'auto' | 'on' | 'off';

interface SettingsState {
  theme: Theme;
  apiUrl: string;
  apiKey: string;
  model: string;
  persona: string;
  demoMode: DemoMode;
  /** Runtime-only: result of the latest /health probe (null = not probed yet). */
  backendOnline: boolean | null;

  setTheme: (t: Theme) => void;
  setApiUrl: (v: string) => void;
  setApiKey: (v: string) => void;
  setModel: (v: string) => void;
  setPersona: (v: string) => void;
  setDemoMode: (v: DemoMode) => void;
  setBackendOnline: (v: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      apiUrl: '',
      apiKey: '',
      model: '',
      persona: 'default',
      demoMode: 'auto',
      backendOnline: null,

      setTheme: (theme) => set({ theme }),
      setApiUrl: (apiUrl) => set({ apiUrl }),
      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
      setPersona: (persona) => set({ persona }),
      setDemoMode: (demoMode) => set({ demoMode }),
      setBackendOnline: (backendOnline) => set({ backendOnline }),
    }),
    {
      name: 'oj-app-settings',
      partialize: (s) => ({
        theme: s.theme,
        apiUrl: s.apiUrl,
        apiKey: s.apiKey,
        model: s.model,
        persona: s.persona,
        demoMode: s.demoMode,
      }),
    },
  ),
);
