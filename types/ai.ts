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
