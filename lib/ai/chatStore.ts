import type { AiMessage } from "@/types/ai";
import type { Property } from "@/types/api";

export type StoredChatEntry = AiMessage & {
  properties?: Property[];
  requiresLogin?: boolean;
};

export type StoredChat = {
  messages: StoredChatEntry[];
  /** Persisted alongside the history so the anonymous free-preview gate
   *  survives a reopen — restoring the chat without it would hand a gated
   *  visitor a fresh input box every time they closed the panel. */
  loginRequired: boolean;
};

const KEY_PREFIX = "diggaj_ai_chat";

// sessionStorage, not localStorage: this history contains budgets and preferred
// localities, and a resale listing site gets opened on shared machines. Per-tab
// lifetime is enough to fix the actual complaint (closing the panel, navigating,
// or reloading used to wipe the chat) without leaving that on disk afterwards.
// Swapping to localStorage is a one-line change here if cross-session
// continuity is ever wanted more than that.
function storage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    // Safari in private mode and cookie-blocking setups throw on access rather
    // than returning null.
    return null;
  }
}

/** Chats are scoped per surface: the generic search chat and each
 *  property-specific chat are separate conversations and must not restore into
 *  one another. */
export function chatKey(propertyId?: string) {
  return propertyId ? `${KEY_PREFIX}:property:${propertyId}` : `${KEY_PREFIX}:generic`;
}

// Cap on persisted turns. Entries carry full Property objects for the result
// cards, so an unbounded history would grow toward sessionStorage's ~5MB quota;
// this also matches the server only ever resending the last MAX_HISTORY turns
// (app/api/ai/chat/route.ts), so older entries have no effect on replies anyway.
const MAX_STORED_ENTRIES = 40;

export function loadChat(key: string): StoredChat | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredChat;
    if (!Array.isArray(parsed?.messages) || parsed.messages.length === 0) return null;
    return { messages: parsed.messages, loginRequired: Boolean(parsed.loginRequired) };
  } catch {
    // Corrupt or shape-changed payload — drop it rather than crash the panel.
    store.removeItem(key);
    return null;
  }
}

export function saveChat(key: string, chat: StoredChat) {
  const store = storage();
  if (!store) return;
  const trimmed = chat.messages.slice(-MAX_STORED_ENTRIES);
  try {
    store.setItem(key, JSON.stringify({ ...chat, messages: trimmed }));
  } catch {
    // Over quota: retry with just the tail, and give up silently if even that
    // fails. Losing persistence must never break sending a message.
    try {
      store.setItem(key, JSON.stringify({ ...chat, messages: trimmed.slice(-8) }));
    } catch {
      /* no-op */
    }
  }
}

export function clearChat(key: string) {
  storage()?.removeItem(key);
}

/** Wipe every stored chat — used on logout so the next account doesn't inherit
 *  the previous one's conversation. */
export function clearAllChats() {
  const store = storage();
  if (!store) return;
  for (const k of Object.keys(store)) {
    if (k.startsWith(KEY_PREFIX)) store.removeItem(k);
  }
}
