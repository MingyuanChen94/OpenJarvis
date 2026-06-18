import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowUp, Mic, Paperclip, Square } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/cn';
import { features } from '@/lib/features';
import type { ModelInfo } from '@/types';

interface ComposerProps {
  onSend: (text: string) => void;
  onStop: () => void;
  streaming: boolean;
  models: ModelInfo[];
  model: string;
  onModelChange: (id: string) => void;
}

export function Composer({ onSend, onStop, streaming, models, model, onModelChange }: ComposerProps) {
  const [value, setValue] = useState('');
  const [listening, setListening] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const submit = () => {
    const text = value.trim();
    if (!text || streaming) return;
    onSend(text);
    setValue('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape' && streaming) {
      e.preventDefault();
      onStop();
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const toggleMic = () => {
    setListening((l) => !l);
    if (!listening) {
      toast('Listening… (demo)', { description: "Speech-to-text isn't wired in this build." });
    }
  };

  return (
    <div className="border-t border-border bg-bg/70 px-4 py-3">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-border bg-surface p-2 shadow-sm transition-shadow focus-within:border-accent/60 focus-within:shadow-glow">
          <textarea
            ref={ref}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Message OpenJarvis…  (⌘⏎ to send)"
            className="scrollbar-thin max-h-[200px] w-full resize-none bg-transparent px-2 py-1.5 text-sm text-text outline-none placeholder:text-muted"
          />
          <div className="flex items-center gap-1.5 px-1">
            {features.attachments && (
              <Tooltip content="Attach files (demo)">
                <Button variant="ghost" size="icon-sm" onClick={() => toast('Attachments coming soon')}>
                  <Paperclip className="h-4 w-4" />
                </Button>
              </Tooltip>
            )}
            {features.voiceInput && (
              <Tooltip content="Voice input (demo)">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={toggleMic}
                  className={cn(listening && 'text-accent')}
                >
                  <Mic className={cn('h-4 w-4', listening && 'animate-pulse')} />
                </Button>
              </Tooltip>
            )}

            <select
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
              aria-label="Model"
              className="ml-1 h-7 max-w-[40vw] cursor-pointer truncate rounded-md border border-border bg-surface px-2 text-xs text-muted outline-none transition-colors hover:bg-surface-2 focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              {models.length === 0 && <option value="">No models</option>}
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id}
                </option>
              ))}
            </select>

            <div className="ml-auto">
              {streaming ? (
                <Button size="icon" variant="subtle" onClick={onStop} aria-label="Stop generating">
                  <Square className="h-4 w-4" />
                </Button>
              ) : (
                <Button size="icon" onClick={submit} disabled={!value.trim()} aria-label="Send message">
                  <ArrowUp className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <p className="mt-1.5 text-center text-[11px] text-muted">
          Local-first — responses can be imperfect. Verify important info.
        </p>
      </div>
    </div>
  );
}
