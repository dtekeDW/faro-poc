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
| `type-hero` | `clamp(3rem, 10.5vw, 9.5rem)` | 0.90 | −0.035em |
| `type-section` | `clamp(2.25rem, 6.8vw, 5.75rem)` | 0.96 | −0.03em |
| `type-nav` | `clamp(2.5rem, 7.5vw, 5.5rem)` | 1.02 | −0.03em |
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

Two text entrances, both ports of smoothui components with their values
carried over unchanged:

- **`FocusBlurResolve`** — `blur(14px)`, `opacity 0`, `translateY(14px)`,
  `scale(1.01)` resolving on `cubic-bezier(0.22, 1, 0.36, 1)`. The original
  ships 760ms; the hero passes **1450ms** because a line set at 9.5rem resolves
  across far more area and the stock duration reads hurried at that size. Used
  on two lines only: the hero and the pull quote.
- **`PerCharacterRise`** — letters from `opacity 0` and `y 32` on
  `cubic-bezier(0.2, 0.8, 0.2, 1)`, 0.7s, 24ms stagger. Its own documentation
  says *best on 40px+ headlines*, so it carries the section headings and one
  short label, never body copy. Characters are grouped per word so a line break
  cannot fall inside a word — the original allows that, and the headings here
  run to three lines.

### The hero sequence

One choreographed entrance, not four independent ones. Each delay begins where
the previous move has visibly settled:

| At | What |
| --- | --- |
| 140ms | Headline resolves from blur, over 1450ms |
| 1150ms | Rule draws itself left to right, over 1100ms |
| 1650ms | Supporting row drifts up, over 900ms |
| 1750ms | “Play showreel” rises per character |

The menu is the other authored moment: the panel clips down while the ground
inverts underneath it, as one gesture rather than two effects. Everything else
is a state change.

`prefers-reduced-motion` collapses all durations globally.

## Layout

`--space-section` (7rem, 10rem from 768px) and `--space-gutter` (1.5rem,
2.5rem) are the base rhythm values. Three primitives apply them:

| Class | Block padding | Used for |
| --- | --- | --- |
| `.section-tight` | 0.5× | Supporting bands — stats, client wall |
| `.section` | 1× | Default |
| `.section-loose` | 1.6× | Sections that need a pause around them — works, playground, questions |

A page where every band carries the same padding reads as evenly important
throughout, which is the same as reading as unimportant. The cadence across the
homepage is deliberately uneven: full-bleed, loose, default, loose, full-bleed,
tight, tight, loose.

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

## Photography

Every image comes from one curated set in `app/composables/usePhotography.ts`,
referencing picsum's fixed catalogue (`/id/<n>/…`) rather than its random
`/seed/<word>` endpoint — so the same picture comes back on every load.

Photographs appear only where they are the subject — hero, work, gallery,
capability panel. They never sit behind type: a photograph and a statement
competing for one rectangle weakens both, and the client strip uses drawn marks
rather than stock crops standing in for logos.

The direction is atmospheric and wide: landscape, coast, forest, empty
architecture, muted light, a figure in the frame rather than a face at the
camera. No product shots, no desks, no flat lays.

One grade sits over all of it — `.photo` applies
`grayscale(0.62) contrast(1.08) brightness(0.94)`, including on the gallery
canvas. Subjects still differ, but a shared desaturation is what makes a set of
stills read as one body of work instead of a stock search. Interactive frames
carry `.photo-reveal`, which returns full colour on hover, so approaching an
image feels like looking closer at it.
