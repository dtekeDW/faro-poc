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

## Where the numbers come from

- **`/lab`** — a live run in front of an audience. Honest caveat: values
  measured inside an iframe are not identical to a top-level navigation, since
  the browser is already warm. Good enough for relative statements, which is
  all a demo needs.
- **Playwright seeder** — fills the p75 curves before the meeting, and can
  produce INP because CDP-driven input is trusted. Any number worth quoting
  comes from here.
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
