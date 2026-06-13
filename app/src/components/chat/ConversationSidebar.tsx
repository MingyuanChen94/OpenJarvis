import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { formatRelativeTime } from '@/lib/format';
import { useChat } from '@/store/chat';

export function ConversationSidebar() {
  const conversations = useChat((s) => s.conversations);
  const activeId = useChat((s) => s.activeId);
  const setActive = useChat((s) => s.setActive);
  const createConversation = useChat((s) => s.createConversation);
  const deleteConversation = useChat((s) => s.deleteConversation);

  return (
    <div className="hidden h-full w-[260px] shrink-0 flex-col border-r border-border bg-surface/30 lg:flex">
      <div className="p-3">
        <Button className="w-full" onClick={() => createConversation()}>
          <Plus className="h-4 w-4" /> New chat
        </Button>
      </div>
      <div className="scrollbar-thin flex-1 overflow-y-auto px-2 pb-3">
        {conversations.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-muted">No conversations yet</p>
        )}
        {conversations.map((c) => (
          <div
            key={c.id}
            onClick={() => setActive(c.id)}
            className={cn(
              'group relative flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors',
              c.id === activeId ? 'bg-surface-2 text-text' : 'text-muted hover:bg-surface-2/60',
            )}
          >
            <MessageSquare className="h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-text">{c.title}</div>
              <div className="truncate text-[10px] text-muted">{formatRelativeTime(c.updatedAt)}</div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteConversation(c.id);
              }}
              aria-label="Delete conversation"
              className="absolute right-1.5 hidden rounded p-1 text-muted hover:bg-border hover:text-danger group-hover:block"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
