# Design system

The surface is built from three type roles, two grounds and one accent. Every
rule below lives in `app/assets/css/main.css`; components reference it through
class names and never restate a value.

## Type

| Role | Face | Used for |
| --- | --- | --- |
| Display | **Golos Text** | Anything meant to be *looked at* — hero, section heads, nav |
| Text | **Figtree** | Anything meant to be *read* — body, labels, controls |
| Data | **Geist Mono** | Anything meant to be *compared* — counts, durations, timecodes |

Golos is broad and grounded rather than geometric, so it takes tight tracking
well and needs weight 700 to hold a hero — at 600 it goes soft at display size.
Figtree sits under it with a softer, rounder construction and a high x-height,
which keeps body copy fast to read without competing with the headline.

The pairing works because the two differ in *construction*, not in width. Two
faces of the same build would read as an accident rather than a decision.

Numbers use `type-data`, which sets tabular figures. Comparing a column of
proportional numerals is guesswork.

### Scale

| Class | Size | Leading | Tracking |
| --- | --- | --- | --- |
| `type-hero` | `clamp(2.75rem, 9vw, 7.5rem)` | 0.90 | −0.035em |
| `type-section` | `clamp(2rem, 5.2vw, 4rem)` | 0.96 | −0.03em |
| `type-nav` | `clamp(2.25rem, 7vw, 5rem)` | 1.02 | −0.03em |
| `type-title` | `clamp(1.125rem, 1.8vw, 1.5rem)` | 1.15 | −0.015em |
| `type-body` | 0.9375rem, capped at 68ch | 1.65 | — |
| `type-small` | 0.875rem | 1.5 | — |
| `type-micro` | 0.6875rem, uppercase | 1.4 | +0.36em |

`type-micro` is the only positive tracking in the system. It is legible only
because it is short and uppercase; it must never carry a sentence.

## Colour

| Token | Value | Role |
| --- | --- | --- |
| `--color-ink` | `#060606` | Page ground |
| `--color-ink-raised` | `#0e1013` | Surfaces that sit above the ground |
| `--color-dodger` | `#1095fb` | The only hue. Active state, link, menu ground |
| `--color-dodger-deep` | `#0a6cb8` | Pressed and deep accents |
| `--color-chalk` | `#f2f5f8` | Primary foreground |
| `--color-mute` | `#8a949e` | Secondary foreground |

Measured contrast on ink: chalk **18.5:1**, mute **6.6:1**, dodger **6.5:1**.
Ink on dodger is also **6.5:1**, which is what makes the inverted menu legible
without a second palette.

Mute is tinted cool rather than gray so secondary text belongs to the same
light as the accent. A neutral gray here reads as a different system.

`--ground` is a separate variable that the menu rewrites at runtime. Every
surface reads from it, so the whole page inverts in one transition instead of
each section animating its own background.

## Motion

One curve: `--ease-out-expo` (`cubic-bezier(0.16, 1, 0.3, 1)`) — fast commit,
long settle. Its mirror `--ease-in-expo` is used only for exits.

| Token | Value | Used for |
| --- | --- | --- |
| `--duration-quick` | 300ms | Colour and border changes |
| `--duration-settle` | 600ms | Ground inversion, underline wipes |
| `--duration-stage` | 900ms | The menu panel reveal |

The menu is the single authored moment: the panel clips down while the ground
inverts underneath it, as one gesture rather than two effects. Everything else
is a state change.

`prefers-reduced-motion` collapses all durations globally.

## Layout

`--space-section` (6rem, 8rem from 768px) and `--space-gutter` (1.5rem,
2.5rem) are the only rhythm values. The `.section` primitive applies both, so
a section never states its own padding.

`.rule` is the single hairline: `chalk` at 10% opacity.

## Controls

- `.pill` — the filter control. Border by default, solid accent when
  `data-active="true"`.
- `.link-wipe` — underline that wipes in from the left on hover, using the
  system easing and `currentColor` so it works on any ground.

## Browser surfaces

Text selection, scrollbar, focus ring and caret are all themed from the
palette. Left at their defaults these belong to no design system.

Focus rings are never removed — `:focus-visible` draws a 2px accent outline
with a 3px offset on every focusable element.

## Fonts

Three families, self-hosted through `@nuxt/fonts` and declared explicitly in
`nuxt.config.ts`. Display and text roles read `var(--font-display)` and
`var(--font-text)`; the literal names live on `.font-display` / `.font-text`,
which is what the scanner reads.
Tailwind v4 compiles font utilities to `var()` references, which the scanner
cannot read as font-family declarations, so the literal names in
`main.css` are what makes the download happen. Removing them silently ships a
page with no webfonts at all.

The generated `@font-face` set includes metric-matched fallbacks
(`size-adjust`, `ascent-override`), so the swap does not shift layout — the CLS
this project measures should come only from the modules degraded on purpose.
