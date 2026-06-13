import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Conversation, Message } from '@/types';
import { uid } from '@/lib/id';

interface ChatState {
  conversations: Conversation[];
  activeId: string | null;

  createConversation: (model?: string) => string;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, title: string) => void;
  clearAll: () => void;
  setActive: (id: string) => void;

  addMessage: (convId: string, msg: Message) => void;
  patchMessage: (convId: string, msgId: string, patch: Partial<Message>) => void;
  appendContent: (convId: string, msgId: string, delta: string) => void;
}

function touch(conv: Conversation): Conversation {
  return { ...conv, updatedAt: Date.now() };
}

export const useChat = create<ChatState>()(
  persist(
    (set) => ({
      conversations: [],
      activeId: null,

      createConversation: (model) => {
        const id = uid('conv');
        const now = Date.now();
        const conv: Conversation = {
          id,
          title: 'New chat',
          messages: [],
          model,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ conversations: [conv, ...s.conversations], activeId: id }));
        return id;
      },

      deleteConversation: (id) =>
        set((s) => {
          const conversations = s.conversations.filter((c) => c.id !== id);
          const activeId =
            s.activeId === id ? (conversations[0]?.id ?? null) : s.activeId;
          return { conversations, activeId };
        }),

      renameConversation: (id, title) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? touch({ ...c, title }) : c,
          ),
        })),

      clearAll: () => set({ conversations: [], activeId: null }),

      setActive: (id) => set({ activeId: id }),

      addMessage: (convId, msg) =>
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== convId) return c;
            // Auto-title from the first user message.
            const title =
              c.messages.length === 0 && msg.role === 'user'
                ? msg.content.slice(0, 48) || c.title
                : c.title;
            return touch({ ...c, title, messages: [...c.messages, msg] });
          }),
        })),

      patchMessage: (convId, msgId, patch) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id !== convId
              ? c
              : touch({
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === msgId ? { ...m, ...patch } : m,
                  ),
                }),
          ),
        })),

      appendContent: (convId, msgId, delta) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id !== convId
              ? c
              : touch({
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === msgId ? { ...m, content: m.content + delta } : m,
                  ),
                }),
          ),
        })),
    }),
    {
      name: 'oj-app-conversations',
      partialize: (s) => ({ conversations: s.conversations, activeId: s.activeId }),
    },
  ),
);
