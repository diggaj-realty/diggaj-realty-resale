"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { askAi } from "@/lib/api/ai";
import { ApiError } from "@/lib/api/client";
import { CloseIcon } from "@/components/dashboard/icons";
import ListingCard from "@/components/listings/ListingCard";
import type { AiMessage, AiPropertyContext } from "@/types/ai";
import type { Property } from "@/types/api";

type ChatEntry = AiMessage & { properties?: Property[]; requiresLogin?: boolean };

const GENERIC_GREETING: ChatEntry = {
  role: "assistant",
  content: "Hey! What kind of place are you after? Toss me a city, a budget, whatever you've got — I'll go dig up some real listings.",
};

function greetingFor(propertyContext?: AiPropertyContext): ChatEntry {
  if (!propertyContext) return GENERIC_GREETING;
  return {
    role: "assistant",
    content: `Hey! Want me to summarize "${propertyContext.title}" for you, or is there something specific about it you're wondering about?`,
  };
}

export default function AiSearchPanel({
  onClose,
  propertyContext,
}: {
  onClose: () => void;
  /** When set, this chat is scoped to a property detail page — the greeting
   *  offers to summarize it and every reply stays grounded in it (see
   *  app/api/ai/chat/route.ts's systemPromptFor). */
  propertyContext?: AiPropertyContext;
}) {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ChatEntry[]>([greetingFor(propertyContext)]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Once the server says the free anonymous preview is used up, the input
  // is replaced by an inline sign-in prompt — the gate lives in the chat
  // itself rather than a popup/redirect.
  const [loginRequired, setLoginRequired] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function send() {
    const text = input.trim();
    if (!text || sending || loginRequired) return;
    setInput("");
    setError(null);
    const next: ChatEntry[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setSending(true);
    try {
      const res = await askAi(
        token,
        next.map(({ role, content }) => ({ role, content })),
        propertyContext
      );
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.reply, properties: res.properties, requiresLogin: res.requiresLogin },
      ]);
      if (res.requiresLogin) setLoginRequired(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        aria-label="Close AI search"
        onClick={onClose}
        className="fixed inset-0 z-[90] bg-ink/40 backdrop-blur-sm"
      />
      <div className="fixed inset-y-0 right-0 z-[100] flex w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-ink">✦ AI Search</p>
            <p className="text-xs text-body">Find your next home by chatting</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close AI search"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/5 text-ink/60 hover:bg-ink/10"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-4">
            {messages.map((m, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[85%] rounded-2xl rounded-br-sm bg-panel px-4 py-2.5 text-sm text-white"
                        : "max-w-[85%] rounded-2xl rounded-bl-sm bg-cream px-4 py-2.5 text-sm text-ink"
                    }
                  >
                    {m.content}
                  </div>
                </div>
                {m.properties && m.properties.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {m.properties.map((p, pi) => (
                      <ListingCard key={p.id} property={p} i={pi} />
                    ))}
                  </div>
                )}
                {m.requiresLogin && (
                  <div className="flex justify-start">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 rounded-full bg-panel px-4 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-px"
                    >
                      Sign in to keep chatting →
                    </Link>
                  </div>
                )}
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-cream px-4 py-2.5 text-sm text-body">
                  Thinking…
                </div>
              </div>
            )}
            {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t border-ink/10 p-4">
          {loginRequired ? (
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-full bg-panel px-6 py-3.5 text-sm font-medium text-white transition-transform hover:-translate-y-px"
            >
              Sign in to keep chatting →
            </Link>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. 3BHK under 2Cr in Bangalore…"
                className="flex-1 rounded-full bg-ink/5 px-4 py-3 text-sm outline-none focus:outline-none focus:ring-2 focus:ring-lime"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                aria-label="Send"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-panel text-white disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
