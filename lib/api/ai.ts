import { ApiError } from "@/lib/api/client";
import type { AiChatResponse, AiMessage, AiPropertyContext } from "@/types/ai";

/** Talks to our own server-side proxy (app/api/ai/chat), never Anthropic
 *  directly — the API key must never reach the browser. `token` is optional:
 *  anonymous visitors get a free preview (see the route's FREE_MESSAGE_LIMIT)
 *  before it starts asking them to sign in. `propertyContext`, when set (a
 *  property detail page's assistant), keeps replies grounded in the property
 *  being viewed instead of a generic search. */
export async function askAi(
  token: string | null,
  messages: AiMessage[],
  propertyContext?: AiPropertyContext
): Promise<AiChatResponse> {
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ messages, propertyContext }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new ApiError(json?.error?.message ?? `Request failed (${res.status})`, res.status);
  }
  return json.data as AiChatResponse;
}
