import { Outlet } from 'react-router';
import { SideRail } from '@/components/layout/SideRail';
import { TopBar } from '@/components/layout/TopBar';
import { ConnectionBanner } from '@/components/layout/ConnectionBanner';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { ShortcutsDialog } from '@/components/layout/ShortcutsDialog';
import { MobileNav } from '@/components/layout/MobileNav';
import { useGlobalHotkeys } from '@/hooks/useGlobalHotkeys';

export function AppShell() {
  useGlobalHotkeys();

  return (
    <div className="flex h-full w-full overflow-hidden">
      <SideRail />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <ConnectionBanner />
        <main className="min-h-0 flex-1 overflow-hidden">
          <Outlet />
        </main>
        <MobileNav />
      </div>
      <CommandPalette />
      <ShortcutsDialog />
    </div>
  );
}
