import type { Property } from "@/types/api";

type AiRole = "user" | "assistant";

export type AiMessage = {
  role: AiRole;
  content: string;
};

export type AiChatResponse = {
  reply: string;
  properties: Property[];
  /** Anonymous visitor has used up their free preview turns — the chat
   *  itself should now prompt sign-in instead of accepting more messages. */
  requiresLogin?: boolean;
};

/** Lean summary of the property a user is currently viewing — sent with
 *  every chat turn on a property detail page so the assistant stays
 *  contextual (e.g. "want me to summarize this?") instead of treating it
 *  like a fresh, propertyless search. Kept small since it's resent on every
 *  turn (same input-token-cost reasoning as SEARCH_TOOL's own schema). */
export type AiPropertyContext = {
  id: string;
  title: string;
  location: string;
  askingPrice: number;
  bhk?: number | null;
  areaSqft: number;
};
