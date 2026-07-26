import { NextRequest, NextResponse } from "next/server";
import { getProperties } from "@/lib/api/properties";
import { getAmenities, FALLBACK_AMENITIES } from "@/lib/api/amenities";
import type { GetPropertiesParams } from "@/types/api";
import type { AiPropertyContext } from "@/types/ai";

const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";
const ANTHROPIC_VERSION = "2023-06-01";
// Hard ceiling on output tokens, not a target — measured real replies run
// ~100-150 tokens with the current prompt, so this still leaves headroom
// without paying for a runaway response.
// (Prompt caching was considered too, but Haiku 4.5 requires 4,096+ tokens
// per cacheable block before it activates at all — measured: this system
// prompt + the one tool come to ~1,200 input tokens, nowhere near that
// floor, so cache_control here would silently do nothing rather than save
// anything.)
const MAX_TOKENS = 350;
// How many turns of prior conversation to resend each call — this is the
// single biggest lever on input-token cost as a chat gets longer, since the
// full history (not just the new message) is billed every turn.
const MAX_HISTORY = 8;
// Anonymous visitors get this many messages as a free preview before the
// chat itself tells them to sign in — logged-in users have no limit.
const FREE_MESSAGE_LIMIT = 2;

type AnthropicTextBlock = { type: "text"; text: string };
type AnthropicToolUseBlock = { type: "tool_use"; id: string; name: string; input: unknown };
type AnthropicContentBlock = AnthropicTextBlock | AnthropicToolUseBlock;
type AnthropicResponse = { content: AnthropicContentBlock[]; stop_reason: string };

// Kept lean deliberately — this whole schema is resent as input tokens on
// every single call (twice per turn when a search happens), so trimming
// descriptions here is one of the few real, guaranteed cost levers available
// (prompt caching doesn't apply — see MAX_TOKENS comment below).
//
// `amenities` takes the real, admin-managed amenity names as an `enum` (see
// buildSearchTool below) rather than free text — the backend's amenities
// filter matches ALL listed names (AND, not OR) against an exact string, so
// a plausible-sounding guess like "Pool" instead of the real "Swimming Pool"
// used to silently zero out results. Constraining to a real enum, plus
// telling the model the AND semantics, fixes both failure modes at once.
function buildSearchTool(amenityNames: string[]) {
  return {
    name: "search_properties",
    description: "Search Diggaj Realty's live property listings.",
    input_schema: {
      type: "object" as const,
      properties: {
        q: { type: "string", description: "Free text: title/address/city" },
        type: { type: "string", enum: ["RESIDENTIAL", "PLOT", "COMMERCIAL"] },
        city: { type: "string", description: "e.g. Bangalore, Mumbai, Delhi" },
        locality: { type: "string", description: "Area within the city" },
        minPrice: { type: "number", description: "Min price, INR" },
        maxPrice: { type: "number", description: "Max price, INR" },
        minBhk: { type: "number", description: "Min bedrooms" },
        minBathrooms: { type: "number" },
        minArea: { type: "number", description: "Min sqft" },
        maxArea: { type: "number", description: "Max sqft" },
        furnishing: { type: "string", enum: ["UNFURNISHED", "SEMI_FURNISHED", "FULLY_FURNISHED"] },
        facing: { type: "string", enum: ["N", "S", "E", "W", "NE", "NW", "SE", "SW"] },
        possessionStatus: { type: "string", enum: ["READY_TO_MOVE", "UNDER_CONSTRUCTION"] },
        maxAgeYears: { type: "number", description: "Max building age, yrs" },
        parking: { type: "boolean" },
        ownershipType: {
          type: "string",
          enum: ["FREEHOLD", "LEASEHOLD", "POWER_OF_ATTORNEY", "CO_OPERATIVE"],
        },
        amenities: {
          type: "array",
          items: { type: "string", enum: amenityNames },
          description:
            "Matches listings having ALL of these (AND, not OR) — pass at most one unless you're confident the user wants that exact combination.",
        },
        sort: {
          type: "string",
          enum: ["newest", "price_asc", "price_desc", "area_asc", "area_desc", "most_viewed"],
        },
      },
    },
  };
}

// Also kept lean for the same reason — same per-call cost logic applies.
const SYSTEM_PROMPT = `You're Diggaj Realty's property search assistant, texting casually with a home-hunter — not customer support reading a script. Vary your openers, use contractions, keep it short and loose. No markdown: no lists, bullets, bold, or headers, plain sentences only.

Search proactively: if you have even one clue (city, budget, type, anything), call search_properties right away instead of asking first — narrow down after showing them something. Only ask up front if there's truly nothing to go on.

Found properties already show as photo cards below your message with price/size/details — don't repeat those, just react briefly (how many, what stands out) and ask what matters most next.

Prices are in INR. Empty results: react like a person would (mildly surprised, not clinical) and suggest loosening one thing — budget, area, or bedrooms.`;

/** Prepends the property a user is viewing, when this call comes from a
 *  property detail page rather than a general search — keeps replies (and
 *  an initial "want me to summarize this?") grounded in that listing instead
 *  of treating every message like a fresh, propertyless search. */
function systemPromptFor(propertyContext?: AiPropertyContext): string {
  if (!propertyContext) return SYSTEM_PROMPT;
  return `${SYSTEM_PROMPT}

The user is currently viewing this specific property — ground your replies in it (price, size, location, what stands out) unless they clearly ask to search elsewhere:
"${propertyContext.title}" in ${propertyContext.location} — ₹${propertyContext.askingPrice.toLocaleString("en-IN")} — ${propertyContext.bhk ?? "?"} BHK — ${propertyContext.areaSqft} sqft.`;
}

async function callAnthropic(
  apiKey: string,
  messages: unknown[],
  system: string,
  tool: ReturnType<typeof buildSearchTool>
): Promise<AnthropicResponse> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: MAX_TOKENS,
      system,
      tools: [tool],
      messages,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Anthropic API error (${res.status}): ${text.slice(0, 300)}`);
  }
  return res.json();
}

/** The admin-managed amenity master list, for constraining the model's
 *  `amenities` tool argument to real names (see buildSearchTool). Falls back
 *  to the same static list the backend itself falls back to if the master
 *  table is empty or the request fails. */
async function amenityNames(): Promise<string[]> {
  try {
    const list = await getAmenities();
    return list.filter((a) => a.active).map((a) => a.name);
  } catch {
    return FALLBACK_AMENITIES;
  }
}

/** Confirms the bearer token is a real, currently-valid session — checked
 *  against the actual backend rather than trusted at face value, since this
 *  route (unlike the browser) can spend real API credits per request. */
async function verifyUser(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

function extractText(blocks: AnthropicContentBlock[]): string {
  return blocks
    .filter((b): b is AnthropicTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: { message: "AI assistant is not configured." } }, { status: 503 });
  }

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  const authenticated = !!token && (await verifyUser(token));

  let body: { messages?: { role: string; content: string }[]; propertyContext?: AiPropertyContext };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: { message: "Invalid request body" } }, { status: 400 });
  }
  const history = (body.messages ?? []).slice(-MAX_HISTORY);
  if (history.length === 0) {
    return NextResponse.json({ error: { message: "messages is required" } }, { status: 400 });
  }

  // Anonymous: count how many turns they've already used (the client always
  // sends the full conversation, so this needs no server-side session state)
  // and stop calling Anthropic — cheaply, without spending API credits —
  // once they're past the free preview.
  if (!authenticated) {
    const userTurns = history.filter((m) => m.role === "user").length;
    if (userTurns > FREE_MESSAGE_LIMIT) {
      return NextResponse.json({
        data: {
          reply: "That's the free preview done — sign in and we can keep going, takes a sec and it's totally free.",
          properties: [],
          requiresLogin: true,
        },
      });
    }
  }

  try {
    const system = systemPromptFor(body.propertyContext);
    const tool = buildSearchTool(await amenityNames());
    const anthMessages: unknown[] = history.map((m) => ({ role: m.role, content: m.content }));
    const first = await callAnthropic(apiKey, anthMessages, system, tool);

    const toolUse = first.content.find((b): b is AnthropicToolUseBlock => b.type === "tool_use");
    if (!toolUse || first.stop_reason !== "tool_use") {
      return NextResponse.json({ data: { reply: extractText(first.content) || "…", properties: [] } });
    }

    const filters = (toolUse.input ?? {}) as GetPropertiesParams;
    let properties: Awaited<ReturnType<typeof getProperties>>["items"] = [];
    try {
      const results = await getProperties({ ...filters, pageSize: 6 }, { cache: "no-store" });
      properties = results.items;
    } catch {
      properties = [];
    }

    // A fixed "nothing found" string would read as scripted no matter how
    // it's worded — worth the extra call to let the model phrase it fresh
    // each time, same as it does for actual results.
    const toolResultSummary = properties.length
      ? properties
          .map(
            (p) =>
              `${p.title} — ${p.city ?? ""}${p.locality ? `, ${p.locality}` : ""} — ₹${p.askingPrice.toLocaleString("en-IN")} — ${p.bhk ?? "?"} BHK — ${p.areaSqft} sqft`
          )
          .join("\n")
      : "No matching live listings found.";

    const second = await callAnthropic(
      apiKey,
      [
        ...anthMessages,
        { role: "assistant", content: first.content },
        {
          role: "user",
          content: [{ type: "tool_result", tool_use_id: toolUse.id, content: toolResultSummary }],
        },
      ],
      system,
      tool
    );

    return NextResponse.json({
      data: { reply: extractText(second.content) || "Here's what I found.", properties },
    });
  } catch (err) {
    console.error("AI chat error:", err);
    return NextResponse.json(
      { error: { message: "The AI assistant is temporarily unavailable." } },
      { status: 502 }
    );
  }
}
