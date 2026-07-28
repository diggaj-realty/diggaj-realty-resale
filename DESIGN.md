# Diggaj Realty — Design System

Single source of truth for the site's visual language. Tokens live in
`app/globals.css` (`@theme`) and are consumed as Tailwind classes
(`bg-panel`, `text-ink`, `bg-lime`, …).

## Color tokens

| Token       | Hex       | Class         | Role                              |
| ----------- | --------- | ------------- | --------------------------------- |
| `page`      | `#d2d2dc` | `bg-page`     | Body background (cool grey)       |
| `ink`       | `#1c1a16` | `text-ink`    | Primary text / near-black         |
| `panel`     | `#171717` | `bg-panel`    | Dark section panels, dark cards   |
| `lime`      | `#cdea6f` | `bg-lime`     | Primary accent / CTAs / highlight |
| `limepale`  | `#eefed4` | `bg-limepale` | Soft lime tint (chips, icon bg)   |
| `body`      | `#6f6f6f` | `text-body`   | Secondary / body copy             |
| `cream`     | `#f4efe5` | `bg-cream`    | Warm section background           |
| white       | `#ffffff` | `bg-white`    | Default section background        |

Common opacity variants: `text-ink/60`, `text-white/70`, `bg-ink/5`,
`border-white/10`, `ring-white/15`.

## Typography

- **Font:** `Inter` via `next/font/google` (`--font-inter`), fallback
  `Helvetica, Arial, sans-serif`.
- **Weights:** `font-medium` (500) is the default for headings and most
  text; `font-semibold` for labels/badges; `font-bold` only on tiny step
  numbers.
- **Tracking:** global `-0.01em`; section titles `-0.02em`; hero/page H1
  `-0.03em`.
- **Scale — fluid.** Display sizes are `clamp()` tokens in `@theme`
  (`app/globals.css`), not breakpoint jumps. Each treats its listed size as
  the **ceiling reached at 2560px** and scales down to a floor at 390px, so
  headings stay proportional at every width instead of snapping once at `md`
  and freezing. Use the token; don't reintroduce `text-5xl md:text-7xl`
  ladders.

  | Token             | 390 → 2560 | Used for                          |
  | ----------------- | ---------- | --------------------------------- |
  | `text-display`    | 44 → 72    | Home hero H1                      |
  | `text-display-sm` | 37 → 60    | Page H1s, Showcase H2             |
  | `text-section`    | 29 → 48    | Section H2s                       |
  | `text-feature`    | 27 → 44    | ValueProp scrubbed sentence       |
  | `text-card-title` | 22 → 36    | Split-card H3s, auth H1s          |
  | `text-subhead`    | 18 → 30    | Minor section headings            |
  | `text-lead`       | 14 → 17    | Lead / intro paragraphs           |

  The floor is ~0.61× the ceiling across all display tiers, which holds the
  hierarchy between them constant at every width. `text-lead` is the
  exception — body copy never drops below 14px.

  Constrain headline measure in `em` (e.g. `max-w-[15em]`), not a fixed
  `max-w-4xl`: a px cap stops matching the type once the size is fluid and
  forces wrapping on wide screens.

- **Fixed (density, not drama):** buttons, chips, badges and card meta stay on
  `text-sm` / `text-xs` / `text-[11px]` / `text-[10px]` — they're UI furniture
  and shouldn't inflate with the viewport.
- **Footer wordmark:** viewport-relative by design, but clamped —
  `clamp(3.5rem, 9vw, 11rem)`. Unbounded `9vw` reached 230px at 2560.

## Shape & elevation

- **Radii:** section panels `rounded-[28px]`; media/cards `rounded-[24px]`;
  inner cards `rounded-2xl`; pills/buttons/chips `rounded-full`.
- **Spacing:** panels inset with `px-3 py-3`; content padding
  `px-8 md:px-14`, vertical rhythm `py-24`.
- **Shadows:** `shadow-lg` (pills), `shadow-2xl` (floating cards).
- **Rings:** `ring-1 ring-white/15` (glass), `ring-ink/10` (light).

## Buttons & chips

| Variant        | Classes                                                          |
| -------------- | --------------------------------------------------------------- |
| Primary dark   | `rounded-full bg-panel px-6 py-3 text-sm text-white`            |
| Primary accent | `rounded-full bg-lime px-6 py-3 text-sm font-semibold text-ink` |
| Chip           | `rounded-full bg-ink/5 px-4 py-2 text-xs font-medium` (active → `bg-panel text-white`) |

Global button interaction (`globals.css`): hover `translateY(-1px)`,
active `scale(0.98)`, focus ring `2px solid lime`.

## Motion

- **Easing:** `[0.25, 0.1, 0.25, 1]` standard; `[0.22, 1, 0.36, 1]`
  pop/overshoot.
- **Entrance:** Framer `whileInView`, fade + `y: 20–28 → 0`, staggered by
  index (`delay: 0.06–0.12 * i`), `viewport={{ once: true }}`.
- **Ambient CSS:** `.drift` (7s float + rotate), `.bob` (5s float) — both
  disabled under `prefers-reduced-motion`.
- **Scroll-scrub:** `useScroll` / `useTransform` for Hero Ken Burns,
  Showcase horizontal track, How It Works facade pan.
- **Smooth scroll:** Lenis via the `SmoothScroll` wrapper in the root
  layout.

## Formatting

- **Currency:** `price()` in `lib/listings.ts` → `₹8.9 Cr`, `₹38 L`, else
  `₹` + `en-IN` grouping.

## Data

- Single source of truth: `lib/listings.ts` (`LISTINGS`, `getListing`,
  `price`). Feeds Hero, How It Works, Showcase, Listings, ListingCard,
  ListingsBrowser, and the detail page.
