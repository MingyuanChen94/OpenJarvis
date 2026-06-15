import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { LazyMotion, domAnimation } from 'motion/react';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { Spinner } from '@/components/ui/Spinner';
import { AppShell } from '@/components/layout/AppShell';
import { ChatView } from '@/components/chat/ChatView';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useApplyTheme } from '@/hooks/useApplyTheme';
import { useBackendStatus } from '@/hooks/useBackendStatus';
import { useSettings } from '@/store/settings';

// Non-flagship routes are code-split so their heavy deps (e.g. Recharts on the
// Dashboard) aren't fetched until the user actually navigates there.
const DashboardView = lazy(() =>
  import('@/components/dashboard/DashboardView').then((m) => ({ default: m.DashboardView })),
);
const AgentsView = lazy(() =>
  import('@/components/agents/AgentsView').then((m) => ({ default: m.AgentsView })),
);
const SettingsView = lazy(() =>
  import('@/components/settings/SettingsView').then((m) => ({ default: m.SettingsView })),
);

function RouteFallback() {
  return (
    <div className="flex h-full items-center justify-center text-muted">
      <Spinner className="h-5 w-5" />
    </div>
  );
}

export default function App() {
  useApplyTheme();
  useBackendStatus();
  const theme = useSettings((s) => s.theme);
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <LazyMotion features={domAnimation} strict>
      <TooltipProvider delayDuration={250}>
        <ErrorBoundary>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<ChatView />} />
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <DashboardView />
                </Suspense>
              }
            />
            <Route
              path="agents"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <AgentsView />
                </Suspense>
              }
            />
            <Route
              path="settings"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <SettingsView />
                </Suspense>
              }
            />
            <Route path="*" element={<ChatView />} />
          </Route>
        </Routes>
      </ErrorBoundary>
        <Toaster theme={isDark ? 'dark' : 'light'} position="bottom-right" richColors closeButton />
      </TooltipProvider>
    </LazyMotion>
  );
}
