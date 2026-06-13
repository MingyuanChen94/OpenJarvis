import { useLocation } from 'react-router';
import { PanelLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Kbd } from '@/components/ui/Kbd';
import { Tooltip } from '@/components/ui/Tooltip';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { ConnectionBadge } from '@/components/layout/ConnectionBadge';
import { useUI } from '@/store/ui';

const TITLES: Record<string, string> = {
  '/': 'Chat',
  '/dashboard': 'Dashboard',
  '/agents': 'Agents',
  '/settings': 'Settings',
};

export function TopBar() {
  const { pathname } = useLocation();
  const toggleSidebar = useUI((s) => s.toggleSidebar);
  const setPaletteOpen = useUI((s) => s.setPaletteOpen);
  const title = TITLES[pathname] ?? 'OpenJarvis';

  return (
    <header className="glass z-10 flex h-14 shrink-0 items-center gap-3 border-b border-border px-3">
      <Tooltip content="Toggle sidebar (⌘B)">
        <Button variant="ghost" size="icon" aria-label="Toggle sidebar" onClick={toggleSidebar}>
          <PanelLeft className="h-[18px] w-[18px]" />
        </Button>
      </Tooltip>

      <h1 className="text-sm font-semibold tracking-tight">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => setPaletteOpen(true)}
          className="hidden cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-muted transition-colors hover:bg-surface-2 md:flex"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search & commands</span>
          <Kbd>⌘K</Kbd>
        </button>
        <ConnectionBadge />
        <ThemeToggle />
      </div>
    </header>
  );
}
