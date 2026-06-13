import { Route, Routes } from 'react-router';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { AppShell } from '@/components/layout/AppShell';
import { ChatView } from '@/components/chat/ChatView';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { AgentsView } from '@/components/agents/AgentsView';
import { SettingsView } from '@/components/settings/SettingsView';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useApplyTheme } from '@/hooks/useApplyTheme';
import { useBackendStatus } from '@/hooks/useBackendStatus';
import { useSettings } from '@/store/settings';

export default function App() {
  useApplyTheme();
  useBackendStatus();
  const theme = useSettings((s) => s.theme);
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <TooltipProvider delayDuration={250}>
      <ErrorBoundary>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<ChatView />} />
            <Route path="dashboard" element={<DashboardView />} />
            <Route path="agents" element={<AgentsView />} />
            <Route path="settings" element={<SettingsView />} />
            <Route path="*" element={<ChatView />} />
          </Route>
        </Routes>
      </ErrorBoundary>
      <Toaster theme={isDark ? 'dark' : 'light'} position="bottom-right" richColors closeButton />
    </TooltipProvider>
  );
}
