import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { demoResponseProvider } from '../../services/chatProvider';

const ChatContext = createContext(null);
const STORAGE_KEY = 'henry-portfolio-conversations-v1';
function readConversations() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored.filter((chat) => typeof chat.id === 'string' && typeof chat.title === 'string' && Array.isArray(chat.messages) && chat.messages.every((message) => ['user', 'assistant'].includes(message.role) && typeof message.text === 'string')).slice(0, 20) : [];
  } catch { return []; }
}

export function ChatProvider({ children, provider = demoResponseProvider }) {
  const [conversations, setConversations] = useState(readConversations);
  const [draft, setDraft] = useState('');
  const [pendingIds, setPendingIds] = useState([]);
  const pending = useRef(new Set());
  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(conversations)); } catch { /* Chat still works when browser storage is unavailable. */ }
  }, [conversations]);

  function send(text, conversationId) {
    const question = text.trim();
    if (!question || pending.current.has(conversationId)) return null;
    const existing = conversations.find((chat) => chat.id === conversationId);
    const id = existing?.id || `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const messages = [...(existing?.messages || []), { role: 'user', text: question }];
    const chat = { id, title: existing?.title || question, messages };
    setConversations((items) => [chat, ...items.filter((item) => item.id !== id)].slice(0, 20));
    pending.current.add(id);
    setPendingIds([...pending.current]);
    Promise.resolve().then(() => provider.respond({ messages })).then((response) => {
      setConversations((items) => items.map((item) => item.id === id ? { ...item, messages: [...item.messages, { role: 'assistant', ...response }] } : item));
    }).catch(() => {
      setConversations((items) => items.map((item) => item.id === id ? { ...item, messages: [...item.messages, { role: 'assistant', label: 'Response unavailable', text: 'The response could not be loaded. Please try sending your question again.' }] } : item));
    }).finally(() => {
      pending.current.delete(id);
      setPendingIds([...pending.current]);
    });
    return id;
  }
  return <ChatContext.Provider value={{ conversations, draft, setDraft, send, pendingIds }}>{children}</ChatContext.Provider>;
}
export const useChat = () => useContext(ChatContext);
