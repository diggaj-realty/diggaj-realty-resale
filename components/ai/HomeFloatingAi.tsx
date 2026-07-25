"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import AiSearchButton from "@/components/ai/AiSearchButton";

// Rendered as a top-level sibling in app/page.tsx, deliberately outside
// HeroSection's framer-motion tree — a `transform` on any ancestor would
// turn this button's `position: fixed` into "fixed relative to that
// ancestor" instead of the viewport, breaking the floating behavior once
// the user scrolls past the hero.
//
// Shown to everyone, not just logged-in users — anonymous visitors get a
// free preview of the chat (see app/api/ai/chat's FREE_MESSAGE_LIMIT)
// before it asks them to sign in, so hiding the button from them would
// make that preview unreachable.
export default function HomeFloatingAi() {
  const { loading } = useAuth();
  if (loading) return null;
  return <AiSearchButton floating />;
}
