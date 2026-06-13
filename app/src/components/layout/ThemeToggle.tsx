import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { useSettings } from '@/store/settings';

export function ThemeToggle() {
  const theme = useSettings((s) => s.theme);
  const setTheme = useSettings((s) => s.setTheme);
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <Tooltip content={isDark ? 'Switch to light' : 'Switch to dark'}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle color theme"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
      >
        {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
      </Button>
    </Tooltip>
  );
}
