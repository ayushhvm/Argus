# CineSeek — Frontend Design Brief

You are redesigning the frontend of **CineSeek**, an Information Retrieval–powered movie discovery platform. This is not a Netflix clone, not an admin dashboard, not a generic SaaS template. Treat this as a design-led rebuild, not a styling pass.

Before writing any code, do a **brainstorm → critique → build** pass:
1. Propose a compact token system (color, type, layout, signature element — see below).
2. Check it against the "avoid" list at the bottom. If anything you proposed is a default you'd reach for on any project regardless of subject, revise it and say what changed.
3. Only then build, following the revised plan exactly.

---

## The one idea everything hangs on

CineSeek's actual mechanic is **relevance**: a query pulls certain movies closer than others. The whole visual identity should be built on that single idea — closeness, not gradient blobs for decoration.

**Signature element:** treat similarity as *physical proximity*, not a percentage badge. When someone searches, results should feel like they're drawing toward the query — closer ones arrive first, sit nearer, glow brighter; weaker matches sit further out, dimmer, slightly smaller. In the Retrieval Playground, this becomes literal: TF-IDF, Semantic, and Hybrid columns each show their own gravity toward the query, so you can *see* the three methods disagree.

Everything else in this brief (color, type, motion) should serve that idea, not compete with it.

---

## Color system — "dusk in a cinema lobby," not candy pastel

Pastel is fine, but candy-pastel-SaaS is the cliché version. Ground the palette in actual light: the warm glow of a projector bulb cutting through cool dusk air.

| Role | Hex | Use |
|---|---|---|
| Background | `#FAF8F4` | warm paper, not cold white |
| Ink | `#1F2233` | near-black with a blue undertone, never pure black |
| Ink secondary | `#6B6F80` | captions, metadata |
| Key light (warm) | `#F2B879` | the "projector" accent — sparingly, for the highest-relevance result, primary CTA |
| Dusk lavender | `#C3AED6` | TF-IDF identity color |
| Dusk blue | `#94B8E8` | Semantic identity color |
| Dusk rose | `#E8A8B0` | Hybrid identity color |

Rule: the warm key-light color is the one accent that means "this is the answer" — use it for the top match and the primary action only. Don't spread it everywhere or it stops meaning anything. The three dusk tones are reserved for their respective retrieval method and shouldn't be reused decoratively elsewhere.

Glass/blur effects: use once, intentionally — on the search bar, because that's the one object the eye should never lose track of while scrolling. Don't apply backdrop-blur to every card; if everything glows, nothing does.

---

## Typography — two voices, because the app has two modes

CineSeek speaks in two registers: *emotional discovery* ("movies about loneliness in space") and *technical retrieval* (precision@5, latency, cosine scores). Let the type system carry that split instead of hiding it.

- **Display (storytelling mode):** a characterful serif with real personality — used only for hero headlines, movie titles, and pull-quotes. Restraint matters here: one or two per screen, never body text.
- **Body (everything else):** a clean humanist sans, set generously, for nav, descriptions, UI copy.
- **Data face:** a monospace or grotesk for anything numeric — scores, latency, precision/recall, percentages. This is what makes the Playground and Analytics pages feel precise instead of decorative. Don't dress up numbers in the display serif; let the data look like data.

Hero headline can be large (64–96px range), but the size should be intentional given the page's content length — don't default to maxing it out everywhere.

---

## Motion — orchestrated, not scattered

Pick **one** moment per page to be the choreographed one, and keep everything else quiet:

- **Landing hero:** on load, a single sequence — headline resolves in, search bar settles into place. One sequence, not five competing ones.
- **Search results:** results animate into position based on relevance (the proximity idea above) — closer matches settle first and land closest to center/top.
- **Playground:** when the query changes, don't just fade — actually animate cards re-ranking and scores ticking to new values, so the disagreement between TF-IDF/Semantic/Hybrid is visible mid-transition, not just in the before/after state.
- **Everywhere else:** hover lift on cards, scroll-triggered fade, nothing louder than that.

Avoid: bounce, rotation, parallax stacked on every section, anything that fires on every scroll tick. If in doubt, cut it — under-animated reads as premium; over-animated reads as a template. Respect `prefers-reduced-motion`.

---

## Pages (keep existing routes/structure, redesign the execution)

- **`/` Landing** — hero with the headline + search bar as the single load-in moment; a short section showing the proximity idea in miniature (e.g., a tiny live preview of results drawing toward a sample query); footer.
- **`/search`** — query input, results as the proximity-ranked grid described above. Each card: poster, title, year, genres, relevance (visualized via the proximity/glow system, not just a number), short explanation of *why* it matched.
- **`/playground`** — the signature page. Query → expanded query → three columns (TF-IDF / Semantic / Hybrid) in their respective dusk tones, each showing top results, scores in the data face, and latency. Changing the query re-ranks live.
- **`/movies/[id]`** — cinematic backdrop hero, title in the display serif, overview/genres/cast, explanation of why it was recommended, similar movies as a horizontal scroll.
- **`/analytics`** — Precision@5, Recall@5, MRR, NDCG, latency as data-face metric cards with Recharts visualizations. Reference point: Vercel Analytics / Linear, not an admin panel — but let the numbers look exact, not decorative.
- **`/dataset` (insights)** — genre/year/rating/keyword distributions. Favor whitespace and one clear chart per insight over dense multi-chart panels.

---

## Copy voice

Write from the person's side of the screen, not the system's. "Movies about loneliness in space" sells the experience better than "Search database." Empty/error states should say what happened and what to do next, plainly — no apologizing, no vague "something went wrong."

---

## Technical constraints

- Next.js (App Router), Framer Motion for animation, Recharts for charts.
- Fully responsive — design mobile intentionally, don't just shrink the desktop grid down.
- Visible keyboard focus states everywhere; respect reduced-motion preference.
- Lazy-load images, dynamic-import heavy chart/animation bundles.

---

## Avoid

- Netflix, cyberpunk, hacker, Bootstrap, or generic-dashboard aesthetics.
- Pure black backgrounds, harsh borders, hard drop shadows.
- Glassmorphism applied to *everything* — reserve it for the search bar.
- Numeric relevance scores as the only signal of ranking — show it spatially per the signature element.
- The three current AI-default looks regardless of brief: (1) warm cream + high-contrast serif + terracotta accent, (2) near-black + single neon accent, (3) broadsheet hairline-rule newspaper layout. If your plan lands on one of these by default, revise it.
- Decoration that doesn't encode information — no numbered "01 / 02 / 03" markers unless something is genuinely sequential.

Spend your boldest choice on the proximity/relevance visualization. Keep everything around it disciplined and quiet.
