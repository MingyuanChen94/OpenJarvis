import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Kbd } from '@/components/ui/Kbd';
import { useUI } from '@/store/ui';

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ['⌘', 'K'], label: 'Open command palette' },
  { keys: ['⌘', 'B'], label: 'Toggle sidebar' },
  { keys: ['⌘', 'N'], label: 'New chat' },
  { keys: ['⌘', '/'], label: 'Show this help' },
  { keys: ['⌘', '⏎'], label: 'Send message' },
  { keys: ['Esc'], label: 'Stop streaming / close dialogs' },
];

export function ShortcutsDialog() {
  const open = useUI((s) => s.shortcutsOpen);
  const setOpen = useUI((s) => s.setShortcutsOpen);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogTitle>Keyboard shortcuts</DialogTitle>
        <DialogDescription>Move faster across the app.</DialogDescription>
        <ul className="mt-4 flex flex-col gap-1">
          {SHORTCUTS.map((s) => (
            <li
              key={s.label}
              className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-surface-2"
            >
              <span className="text-muted">{s.label}</span>
              <span className="flex items-center gap-1">
                {s.keys.map((k, i) => (
                  <Kbd key={i}>{k}</Kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
