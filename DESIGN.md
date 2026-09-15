# Design system

The surface is built from three type roles, two grounds and one accent. Every
rule below lives in `app/assets/css/main.css`; components reference it through
class names and never restate a value.

## Type

| Role    | Face           | Used for                                                       |
| ------- | -------------- | -------------------------------------------------------------- |
| Display | **Golos Text** | Anything meant to be _looked at_ — hero, section heads, nav    |
| Text    | **Figtree**    | Anything meant to be _read_ — body, labels, controls           |
| Data    | **Geist Mono** | Anything meant to be _compared_ — counts, durations, timecodes |

Golos is broad and grounded rather than geometric, so it takes tight tracking
well and needs weight 700 to hold a hero — at 600 it goes soft at display size.
Figtree sits under it with a softer, rounder construction and a high x-height,
which keeps body copy fast to read without competing with the headline.

The pairing works because the two differ in _construction_, not in width. Two
faces of the same build would read as an accident rather than a decision.

Numbers use `type-data`, which sets tabular figures. Comparing a column of
proportional numerals is guesswork.

### Scale

| Class          | Size                             | Leading | Tracking |
| -------------- | -------------------------------- | ------- | -------- |
| `type-hero`    | `clamp(3rem, 10.5vw, 9.5rem)`    | 0.90    | −0.035em |
| `type-section` | `clamp(2.25rem, 6.8vw, 5.75rem)` | 0.96    | −0.03em  |
| `type-nav`     | `clamp(2.5rem, 7.5vw, 5.5rem)`   | 1.02    | −0.03em  |
| `type-title`   | `clamp(1.125rem, 1.8vw, 1.5rem)` | 1.15    | −0.015em |
| `type-body`    | 0.9375rem, capped at 68ch        | 1.65    | —        |
| `type-small`   | 0.875rem                         | 1.5     | —        |
| `type-micro`   | 0.6875rem, uppercase             | 1.4     | +0.36em  |

`type-micro` is the only positive tracking in the system. It is legible only
because it is short and uppercase; it must never carry a sentence.

## Colour

| Token                 | Value     | Role                                          |
| --------------------- | --------- | --------------------------------------------- |
| `--color-ink`         | `#060606` | Page ground                                   |
| `--color-ink-raised`  | `#0e1013` | Surfaces that sit above the ground            |
| `--color-dodger`      | `#1095fb` | The only hue. Active state, link, menu ground |
| `--color-dodger-deep` | `#0a6cb8` | Pressed and deep accents                      |
| `--color-chalk`       | `#f2f5f8` | Primary foreground                            |
| `--color-mute`        | `#8a949e` | Secondary foreground                          |

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

| Token               | Value | Used for                          |
| ------------------- | ----- | --------------------------------- |
| `--duration-quick`  | 300ms | Colour and border changes         |
| `--duration-settle` | 600ms | Ground inversion, underline wipes |
| `--duration-stage`  | 900ms | The menu panel reveal             |

Every motion component is a port of a smoothui original with its values carried
over unchanged. The runtime is not: the originals drive `motion/react`, these
run on CSS and the platform's own APIs, so the page ships no animation library
and the text still arrives when scripting fails.

Each one owns exactly one place. A page where every section enters the same way
has no entrance at all.

| Component                | Values                                                                                   | Where                          |
| ------------------------ | ---------------------------------------------------------------------------------------- | ------------------------------ |
| `SoftBlurIn`             | `blur(12px)`, `opacity 0`, `y 16` · 0.9s · `cubic-bezier(0.22, 1, 0.36, 1)` · 25ms/char   | The hero headline              |
| `LineByLineSlide`        | `opacity 0`, `x -48` · 0.9s · same curve · 120ms/line                                     | The hero lede                  |
| `PerCharacterRise`       | `opacity 0`, `y 32` · 0.7s · `cubic-bezier(0.2, 0.8, 0.2, 1)` · 24ms/char                 | Section headings, short labels |
| `FocusBlurResolve`       | `blur(14px)`, `opacity 0`, `y 14`, `scale(1.01)` · same curve                             | The pull-quote heading         |
| `ScrollRevealParagraph`  | Per-word opacity between the viewport offsets `0.9` and `0.25`                            | The pull-quote paragraph       |
| `MagneticButton`         | `strength 0.3`, `radius 150`, 0.4s settle                                                 | The hero's call to action      |
| `CursorFollow`           | 16px dot, 40px labelled bubble                                                            | The gallery canvas             |

Three corrections the originals need here, each for a reason the site created:

- **Characters are grouped per word.** `SoftBlurIn` and `PerCharacterRise` both
  emit every character as its own `inline-block`, which lets a line break fall
  inside a word. The hero runs to two lines and the section headings to three.
  The stagger counts through unchanged.
- **`LineByLineSlide` takes a slot as well as a string.** The lede carries two
  numbers set in `type-data`; a plain string cannot hold them.
- **`ScrollRevealParagraph` exposes one copy of its text.** The original renders
  every word twice — dim underneath, lit above — and reads both to assistive
  technology.

`MagneticButton` and `CursorFollow` do nothing without `(hover: hover) and
(pointer: fine)`. A magnet with no cursor to attract only swallows taps, and
hiding a pointer that does not exist hides nothing.

### The hero sequence

One choreographed entrance, not five independent ones. Each delay begins where
the previous move has visibly settled:

| At     | What                                                    |
| ------ | ------------------------------------------------------- |
| 140ms  | Headline resolves from blur, 25ms per character         |
| 1250ms | Rule draws itself left to right, over 1100ms            |
| 1500ms | Lede slides in from the left, one line every 120ms      |
| 1950ms | Call to action drifts up, over 800ms                    |
| 2050ms | “Play showreel” rises per character                     |

The lede arrives line by line rather than as a block — separately from the call
to action, which as one unit made both feel incidental. The film behind all of
it is deliberately absent from this table: it attaches only once the page has
loaded and gone idle, because the still it covers is the LCP element.

The menu is the other authored moment: the panel clips down while the ground
inverts underneath it, as one gesture rather than two effects. Everything else
is a state change.

`prefers-reduced-motion` collapses all durations globally.

## Layout

`--space-section` (7rem, 10rem from 768px) and `--space-gutter` (1.5rem,
2.5rem) are the base rhythm values. Three primitives apply them:

| Class            | Block padding | Used for                                                              |
| ---------------- | ------------- | --------------------------------------------------------------------- |
| `.section-tight` | 0.5×          | Supporting bands — stats, client wall                                 |
| `.section`       | 1×            | Default                                                               |
| `.section-loose` | 1.6×          | Sections that need a pause around them — works, playground, questions |

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
