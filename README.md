# faro-poc

Synthetic showcase application for the **Grafana Faro** proof of concept ([MOP-8251](https://motel-one.atlassian.net/browse/MOP-8251)).

A fictional video production studio ("Sequence") built to exercise Core Web Vitals
instrumentation. Every module ships an optimized and a deliberately regressed
variant so the same component can be compared side by side in Grafana.

## Stack

Nuxt 4 · Tailwind v4 · Reka UI · `@grafana/faro-web-sdk`

## Run

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env` and fill in the Faro collector URL from
Grafana Cloud → Observability → Frontend → `faro-poc`. Add the dev origin
(`http://localhost:3000`) to that application's allowed origins, otherwise
every beacon is rejected by CORS.

## Degradation variants

Append `?degrade=<modules>` to any route, comma separated, or `?degrade=all`.

| Module | Induced defect | Metric |
| --- | --- | --- |
| `hero` | 2400px hero, lazy, no fetchpriority | LCP |
| `gallery` | oversized tiles, quadratic filter pass | LCP / INP |
| `logos` | logos without width/height, delayed | CLS |
| `filter` | 320ms block inside the click handler | INP |
| `faq` | forced layout thrashing on toggle | INP |

The active variant is attached to every Faro beacon as a session attribute,
which is what lets a dashboard panel compare the two runs of one module.
