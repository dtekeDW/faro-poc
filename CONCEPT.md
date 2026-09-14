# Grafana Faro — proof of concept

Companion to [MOP-8251](https://motel-one.atlassian.net/browse/MOP-8251).
This file records what the PoC demonstrates and why it is built this way, so
the reasoning survives the demo.

## What the ticket left open, and how this answers it

The ticket marks two points **tbd**. Both are closed here.

| Ticket                                                  | Decision                                                                     |
| ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Core Web Vitals erfassen (Metrik-Set: **tbd**)          | LCP · CLS · INP · TTFB · FCP, plus JavaScript exceptions and failed requests |
| Darstellungsform (Dashboard oder Live-Ansicht: **tbd**) | Both — a per-route scoreboard in Grafana, and a live run at `/lab`           |

FID is deliberately absent: it stopped being a Core Web Vital in March 2024 and
was replaced by INP. Dashboards still showing it are out of date.

TTFB is included even though it is not a Core Web Vital, because it is the one
measurement in the set that the frontend cannot fix. Showing it makes the point
that "the site is slow" is not automatically a frontend ticket.

## The central idea: one route, one defect

Every route renders the **same page** and differs only in what is wrong with
it.

| Route     | What is wrong                                  | Metric     |
| --------- | ---------------------------------------------- | ---------- |
| `/`       | nothing — the control                          | all green  |
| `/lcp`    | 2400px hero, loaded lazily, no priority hint   | LCP        |
| `/cls`    | client strip without dimensions, arriving late | CLS        |
| `/inp`    | 320ms of work inside the click handler         | INP        |
| `/ttfb`   | server holds the response for 900ms            | TTFB       |
| `/errors` | a handler throws, a background request fails   | exceptions |

In the dashboard this becomes a table with **exactly one red cell per row**. A
reader who has never seen the tool needs no explanation for that shape; a
single page toggled by query parameters would collapse all six into one row,
because Faro groups signals by page.

The control row matters as much as the broken ones. Without something green to
read them against, six red rows say nothing.

Each scenario is a **standalone page** with its own trigger module, built in
the same design system as the rest of the site. An earlier version rendered the
full marketing homepage beneath every scenario, which broke the measurement:
its hero was the largest element on every route, so each page reported a large
LCP no matter which defect it was built for. One metric, one cause, one page.

Every page shows the measurement live, read from the browser's own performance
entries — the same source `web-vitals` feeds Faro from. The number on screen is
the number that reaches Grafana, which is what closes the loop for a viewer:
press, read, then find the identical value in the dashboard.

## Two constraints that shaped the build

**Paint metrics are measured once per document load.** LCP, FCP and TTFB are
recorded a single time per navigation. A button that walks the routes with the
client-side router would visit six pages and produce _one_ LCP. The lab
therefore drives a real iframe: each frame load is a real document load.

**INP cannot be scripted.** The Event Timing API only records input the browser
considers trusted. A dispatched click produces no INP at all, however slow the
handler is. The lab run pauses on `/inp` and waits for a real click.

This turned out to be the better demo anyway: the viewer clicks, and the number
that appears is _their_ interaction. That is the moment real user monitoring
stops being abstract.

## Attribution — which page a measurement is filed under

The expectation is simple: standing on `/inp` with a bad score, the log should
say `/inp`. Verified in the browser, this holds — on a hard load and across a
client-side navigation, both dimensions follow the route:

| Dimension   | Value on `/cls` | After navigating to `/errors` |
| ----------- | --------------- | ----------------------------- |
| `page.url`  | `…/cls`         | `…/errors`                    |
| `view.name` | `cls`           | `errors`                      |

Both are set explicitly in `ScenarioShell` rather than left to the SDK's
`trackNavigation` flag, because the page a signal is filed under is the whole
point of the demo and should not depend on an experimental option.

**Identity and filter are different things.** The run id was folded into the
page id at first, which meant every run created a fresh set of rows: the same
six scenarios appeared once per run, and an afternoon of testing produced seven
pages of pagination. Page id now answers only _what was measured_ and stays
stable across runs; the run is carried as a page attribute and used as a
filter. The table keeps a fixed set of rows, and a run is chosen rather than
searched for.

The severity belongs in the entry URL for the same reason. Setting it after a
click split each scenario across two rows — the load metrics landed on the URL
the browser arrived at, the interaction landed on whatever the page rewrote
itself to. Every bad state is now a link that can simply be opened:
`/cls?level=storm`, `/inp?level=severe`, `/lcp?v=lazy`, `/ttfb?delay=2000`.

**Telling two runs of the same route apart.** Faro's `page.id` is what the
Page Performance table shows in its first column; unset, it falls back to the
path, so `/cls?test=1` and `/cls?test=2` were indistinguishable. It is now set
explicitly, and a short list of deliberate labelling parameters — `test`, `run`,
`v`, `delay` — becomes part of it:

| URL               | Page ID           | Page attributes              |
| ----------------- | ----------------- | ---------------------------- |
| `/cls`            | `/cls`            | `scenario=cls`, `metric=CLS` |
| `/cls?test=2`     | `/cls?test=2`     | … plus `param_test=2`        |
| `/ttfb?delay=900` | `/ttfb?delay=900` | … plus `param_delay=900`     |

Only that list joins the id. Folding _every_ query parameter into it would be
wrong outside a demo: page id is a grouping key, and a single unbounded
parameter — a search term, a tracking token, a session id — turns a readable
table into thousands of one-visit rows. Every other parameter is still carried,
as a `param_*` attribute, so it stays filterable without becoming identity.

**The exception that causes confusion.** LCP, FCP and TTFB are recorded once
per document load and are therefore filed under the URL the browser _entered_
on. Landing on `/` and navigating to `/inp` produces an INP filed under `/inp`
— correct — but no LCP for `/inp` at all, because no document was loaded there.
Its LCP belongs to `/`.

So a per-route paint comparison only exists if each route was entered
directly. That is precisely what the iframe runner at `/lab` guarantees, and
why a router-driven run would produce an empty table.

## A trap worth demonstrating: CLS ignores what you asked for

Layout shifts within 500ms of a user interaction carry `hadRecentInput` and are
excluded from the score by design — an accordion opening is expected movement
and should not be penalised.

A button that injects content on click therefore provokes **nothing at all**,
which is exactly the bug the first version of the CLS lab had. The injection is
now delayed past that window, which is also how the real offenders behave: an
ad slot, a late consent bar, a web font swapping in after the paragraph has
been read.

**CLS is not a sum.** It is the largest five-second burst of shifts — entries
join the current burst while they fall within one second of the previous one
and five seconds of the first, and the reported value is the worst burst ever
recorded. The first version of the lab displayed a running total instead, which
both overstated the score and made it feel unresponsive: separate presses land
in separate bursts, so only the largest counted and pressing more changed
nothing.

The lab now shows both numbers side by side, because the gap between them is
itself the lesson: twenty small nudges spread over a minute score far better
than one late hero.

Two further corrections followed from testing it. Blocks injected inside a
panel stopped raising the score after the first press, because the content they
displaced had already scrolled out of view — and a shift is scored by how much
of the _viewport_ moved times how far it travelled. They are now injected at the
very top of the page, so they displace everything on screen, exactly as a late
consent bar does.

And because separate presses land in separate bursts and therefore never add
up, a **Storm** option sends four arrivals a third of a second apart. They chain
into one burst and their values accumulate, which is the only way separate
shifts ever combine.

**There is no deadline.** CLS accumulates for the entire life of the page and
is reported when it is hidden or left. A shift an hour after load still counts,
which is why long-lived pages and infinite scrolls are where it usually goes
wrong.

## What it takes to actually fail each metric

Provoking a bad score turned out to be harder than expected, and every failure
was silent — a green number, never an error. Verified end to end in Grafana:

| Page                            | Measured                       |
| ------------------------------- | ------------------------------ |
| `/lcp?v=good` · `v=heavy`       | 240ms · 320ms — good           |
| `/lcp?v=slow`                   | **3036ms** — needs improvement |
| `/lcp?v=lazy`                   | **4100ms** — poor              |
| `/inp?level=instant` → `severe` | 40 · 144 · 376 · **832ms**     |
| `/cls?level=storm` · `severe`   | **0.409** · **0.500**          |

**LCP is not about file size.** The first version served a 2400px original and
still scored green: a large image arrives from a nearby server in milliseconds.
What fails the metric is _late bytes_ — a slow origin, an uncached CDN miss, a
hero behind a redirect. The lab now serves its image through an endpoint that
holds the response, and only the delayed variants turn red. Measured: 0.19s
direct against 2.70s delayed.

**CLS ignores movement you asked for**, and is scored as the worst
five-second burst rather than a total. Both are covered above.

CLS, INP, TTFB and error capture all provoke reliably.

## Where the numbers come from

- **`/lab`** — a live run in front of an audience. Honest caveat: values
  measured inside an iframe are not identical to a top-level navigation, since
  the browser is already warm. Good enough for relative statements, which is
  all a demo needs.
- **Playwright seeder** — fills the p75 curves before the meeting, and can
  produce INP because CDP-driven input is trusted. Any number worth quoting
  comes from here. Runs are **targeted and labelled**: a run touches only the
  pages that provoke the metric it is named after, plus the control, and every
  URL carries `run=<id>`. The id leads with the target, so a dashboard filter
  reads as the question it answers — `run=inp-2026-09-14-1803-mxzd`.
- **Named runs.** The lab takes a name and folds it into the run id, so a run
  started in front of an audience is `run=inp-po-demo` rather than a timestamp
  to be matched against a clock afterwards.
- **`/lab` as a controller.** The lab no longer drives the scenarios itself; it
  starts a seeding run on the server and streams its log. Driving them in an
  iframe registered the page loads but lost the measurements, because
  web-vitals reports LCP, CLS and INP when a page is hidden or unloaded and
  swapping an iframe's `src` does not deliver those signals reliably.
- **k6 is not used.** Core k6 renders nothing and emits no web vitals at all;
  only the browser module does, and its real strength — load and concurrency —
  is not what a vitals showcase needs.

Automated performance testing is its own ticket
([MOP-8252](https://motel-one.atlassian.net/browse/MOP-8252)), which already
separates lab data from field data. Nothing here tries to pre-empt it.

## Why this transfers to the MS frontend

Each scenario mirrors a pattern from the existing backlog:

| Scenario | Prior tickets                                                          |
| -------- | ---------------------------------------------------------------------- |
| `/lcp`   | MOP-8316 (stage video, mobile), MOP-6431 (large images, mobile)        |
| `/cls`   | MOP-7548 (booking button), MOP-6562 (footer images without dimensions) |
| `/inp`   | the MOP-742x series — booker, menu, map, slider mosaic                 |

The argument to make is therefore not "here is a tool", but: _the questions
answered by hand across a dozen analysis tickets last year are answered
continuously and automatically by this._

## What the PoC explicitly does not decide

Per the ticket's own Abgrenzung: no MS-frontend integration, no productive Faro
configuration, no statement on cost, scaling or rollout.

Two questions it does surface for [MOP-7626](https://motel-one.atlassian.net/browse/MOP-7626):

- **Collector reachability.** Faro is a browser→collector push. A collector
  hosted only inside the network cannot receive beacons from real visitors;
  production needs a public ingress. Feature environments are the cheaper first
  step, because there the browser is already inside the network.
- **Consent.** Faro assigns session identifiers and captures URLs and stack
  traces. A productive integration very likely needs consent gating, the way
  GTM already does, and must be checked against the SSR cookie-stripping
  contract in `packages/nuxt-layer/server/middleware/00-strip-cookies.ts`.
