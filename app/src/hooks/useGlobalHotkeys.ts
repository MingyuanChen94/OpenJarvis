import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useChat } from '@/store/chat';
import { useUI } from '@/store/ui';

/** Bind app-wide keyboard shortcuts. Must be used inside the Router. */
export function useGlobalHotkeys(): void {
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      const ui = useUI.getState();

      if (key === 'k') {
        e.preventDefault();
        ui.setPaletteOpen(!ui.paletteOpen);
      } else if (key === 'b') {
        e.preventDefault();
        ui.toggleSidebar();
      } else if (e.key === '/') {
        e.preventDefault();
        ui.setShortcutsOpen(true);
      } else if (key === 'n') {
        e.preventDefault();
        useChat.getState().createConversation();
        navigate('/');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);
}
