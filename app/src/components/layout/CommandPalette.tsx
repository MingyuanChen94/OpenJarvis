import { useEffect, useMemo, useState, type ComponentType, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router';
import {
  Bot,
  LayoutDashboard,
  MessageSquare,
  MoonStar,
  Plus,
  Search,
  Settings,
  Wifi,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog';
import { Kbd } from '@/components/ui/Kbd';
import { cn } from '@/lib/cn';
import { useChat } from '@/store/chat';
import { useSettings } from '@/store/settings';
import { useUI } from '@/store/ui';

interface Command {
  id: string;
  label: string;
  hint?: string;
  keywords?: string;
  icon: ComponentType<{ className?: string }>;
  run: () => void;
}

export function CommandPalette() {
  const open = useUI((s) => s.paletteOpen);
  const setOpen = useUI((s) => s.setPaletteOpen);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const commands = useMemo<Command[]>(
    () => [
      { id: 'chat', label: 'Go to Chat', keywords: 'home', icon: MessageSquare, run: () => navigate('/') },
      { id: 'dashboard', label: 'Go to Dashboard', keywords: 'energy savings', icon: LayoutDashboard, run: () => navigate('/dashboard') },
      { id: 'agents', label: 'Go to Agents', icon: Bot, run: () => navigate('/agents') },
      { id: 'settings', label: 'Go to Settings', keywords: 'config api key', icon: Settings, run: () => navigate('/settings') },
      {
        id: 'new',
        label: 'New chat',
        hint: '⌘N',
        icon: Plus,
        run: () => {
          useChat.getState().createConversation();
          navigate('/');
        },
      },
      {
        id: 'theme',
        label: 'Toggle light / dark theme',
        icon: MoonStar,
        run: () => {
          const t = useSettings.getState().theme;
          useSettings.getState().setTheme(t === 'dark' ? 'light' : 'dark');
        },
      },
      {
        id: 'demo',
        label: 'Toggle demo mode',
        keywords: 'mock offline backend',
        icon: Wifi,
        run: () => {
          const d = useSettings.getState().demoMode;
          useSettings.getState().setDemoMode(d === 'on' ? 'auto' : 'on');
        },
      },
    ],
    [navigate],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.label} ${c.keywords ?? ''}`.toLowerCase().includes(q));
  }, [query, commands]);

  useEffect(() => {
    setActive(0);
  }, [query, open]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filtered[active];
      if (cmd) {
        close();
        cmd.run();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : close())}>
      <DialogContent showClose={false} className="max-w-xl overflow-hidden p-0">
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="h-4 w-4 text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search commands…"
            className="h-12 w-full bg-transparent text-sm text-text outline-none placeholder:text-muted"
          />
        </div>
        <ul className="scrollbar-thin max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-muted">No matching commands</li>
          )}
          {filtered.map((c, i) => (
            <li key={c.id}>
              <button
                onMouseEnter={() => setActive(i)}
                onClick={() => {
                  close();
                  c.run();
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  i === active ? 'bg-surface-2' : 'hover:bg-surface-2/60',
                )}
              >
                <c.icon className="h-4 w-4 text-muted" />
                <span className="flex-1 text-left text-text">{c.label}</span>
                {c.hint && <Kbd>{c.hint}</Kbd>}
              </button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
