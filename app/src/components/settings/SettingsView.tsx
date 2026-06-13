import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { Check, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { probeHealth } from '@/lib/api';
import { useSettings, type DemoMode, type Theme } from '@/store/settings';

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
}) {
  return (
    <div className="inline-flex rounded-lg bg-surface-2 p-1">
      {options.map(([v, label]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={cn(
            'cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-colors',
            value === v ? 'bg-surface text-text shadow-sm' : 'text-muted hover:text-text',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function Row({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-medium text-text">{title}</div>
        {desc && <div className="text-xs text-muted">{desc}</div>}
      </div>
      {children}
    </div>
  );
}

const PERSONAS = ['default', 'concise', 'friendly', 'researcher', 'coder', 'mentor'];

export function SettingsView() {
  const s = useSettings();
  const [testing, setTesting] = useState(false);

  const themeOptions: [Theme, string][] = [
    ['system', 'System'],
    ['light', 'Light'],
    ['dark', 'Dark'],
  ];
  const demoOptions: [DemoMode, string][] = [
    ['auto', 'Auto'],
    ['on', 'On'],
    ['off', 'Off'],
  ];

  const test = async () => {
    setTesting(true);
    const ok = await probeHealth(3000);
    s.setBackendOnline(ok);
    setTesting(false);
    toast(ok ? 'Connected to backend' : 'No backend reachable', {
      description: ok ? undefined : 'Showing demo data until one is available.',
    });
  };

  return (
    <div className="scrollbar-thin h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-5 py-6">
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Settings</h2>
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="persona">Persona</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Appearance & behavior</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <Row title="Theme" desc="Follow the system or pick a side.">
                  <Segmented value={s.theme} onChange={s.setTheme} options={themeOptions} />
                </Row>
                <Row title="Demo mode" desc="Use simulated data when no backend is available.">
                  <Segmented value={s.demoMode} onChange={s.setDemoMode} options={demoOptions} />
                </Row>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="connection">
            <Card>
              <CardHeader>
                <CardTitle>Backend connection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-text">API base URL</label>
                  <p className="mb-1.5 text-xs text-muted">
                    Leave blank to use the dev proxy / same origin (→ :8000).
                  </p>
                  <Input
                    value={s.apiUrl}
                    onChange={(e) => s.setApiUrl(e.target.value)}
                    placeholder="http://localhost:8000"
                    spellCheck={false}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-text">API key</label>
                  <p className="mb-1.5 text-xs text-muted">
                    Only needed if the server was started with auth enabled.
                  </p>
                  <Input
                    type="password"
                    value={s.apiKey}
                    onChange={(e) => s.setApiKey(e.target.value)}
                    placeholder="sk-…"
                  />
                </div>
                <Button variant="outline" onClick={test} disabled={testing}>
                  {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Test connection
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="persona">
            <Card>
              <CardHeader>
                <CardTitle>Assistant persona</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted">
                  Pick a default style. Applied when a matching backend persona is configured.
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {PERSONAS.map((p) => (
                    <button
                      key={p}
                      onClick={() => s.setPersona(p)}
                      className={cn(
                        'cursor-pointer rounded-lg border px-3 py-2 text-sm capitalize transition-colors',
                        s.persona === p
                          ? 'border-accent bg-accent/10 text-text'
                          : 'border-border text-muted hover:bg-surface-2',
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="mt-6 text-center text-xs text-muted">
          OpenJarvis app · v0.1.0 · settings are stored locally in your browser.
        </p>
      </div>
    </div>
  );
}
