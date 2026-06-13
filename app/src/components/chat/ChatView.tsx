import { useEffect } from 'react';
import { ConversationSidebar } from '@/components/chat/ConversationSidebar';
import { MessageList } from '@/components/chat/MessageList';
import { Composer } from '@/components/chat/Composer';
import { EmptyState } from '@/components/chat/EmptyState';
import { useModels } from '@/hooks/useModels';
import { useStreamChat } from '@/hooks/useStreamChat';
import { useChat } from '@/store/chat';

export function ChatView() {
  const conversations = useChat((s) => s.conversations);
  const activeId = useChat((s) => s.activeId);
  const { models, model, setModel } = useModels();
  const { send, stop, streaming } = useStreamChat();

  // Make sure there is always an active conversation to write into.
  useEffect(() => {
    const st = useChat.getState();
    const active = st.conversations.find((c) => c.id === st.activeId);
    if (!active) st.createConversation();
  }, []);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  const handleSend = (text: string) => {
    let id = activeId;
    if (!id || !conversations.some((c) => c.id === id)) {
      id = useChat.getState().createConversation();
    }
    void send(id, text);
  };

  return (
    <div className="flex h-full">
      <ConversationSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="min-h-0 flex-1">
          {active && active.messages.length > 0 ? (
            <MessageList messages={active.messages} streaming={streaming} />
          ) : (
            <EmptyState onPick={handleSend} />
          )}
        </div>
        <Composer
          onSend={handleSend}
          onStop={stop}
          streaming={streaming}
          models={models}
          model={model}
          onModelChange={setModel}
        />
      </div>
    </div>
  );
}
