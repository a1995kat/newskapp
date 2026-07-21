# ByteNews

A bite-size news reader — condenses free, publisher-provided RSS headlines from
Hindustan Times, Financial Times, and The New York Times into short,
Inshorts/Indian-Express-style cards, organized into **India**, **EU**, and
**Global** tabs. Includes search, bookmarking, and dark mode.

## Why RSS instead of PressReader

PressReader is a paid aggregator that redistributes full paywalled newspaper
and magazine content under commercial licensing agreements — scraping it would
violate its terms of service and the publishers' copyright, so it isn't used
here.

Instead, this app uses the **official public RSS feeds** that these
publishers themselves provide for free syndication of headlines and short
summaries. That's the legitimate, intended way to build a headline aggregator:
no paywalls are bypassed, no full article text is copied, and every card links
straight back to the original publisher for the full story.

Current sources (see `lib/feeds.js` to add/swap):

| Source | Feed | Used for |
|---|---|---|
| Hindustan Times | `feeds/rss/india-news` | India tab |
| Hindustan Times | `feeds/rss/world-news` | Global tab |
| Financial Times | `ft.com/world/europe?format=rss` | EU tab |
| Financial Times | `ft.com/world?format=rss` | Global tab |
| The New York Times | `rss.nytimes.com/.../World.xml` | Global tab, and EU tab when a story mentions Europe |

Publishers occasionally change their RSS URLs. If a feed ever 404s, just
update the `url` for that entry in `lib/feeds.js` — nothing else needs to
change.

## How it works

- `app/api/news/route.js` — a server route that fetches all feeds in
  parallel, parses them, strips HTML, condenses each description into a 1-2
  sentence "bytesize" summary (`lib/summarize.js`), tags each story by region,
  dedupes, and returns JSON. Results are cached for 10 minutes.
- `components/NewsApp.js` — the client UI: tabs, search, dark mode, and
  bookmarks (saved locally in your browser via `localStorage`, not a server).
- `components/NewsCard.js` — the individual story card.

## Run it locally

Requires [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Deploy for free (Vercel)

1. Push this folder to a new GitHub repository (or use `npx vercel` directly
   from this folder without GitHub — see step 3).
2. Go to https://vercel.com, sign up/sign in with GitHub, click **Add New →
   Project**, and import the repository. Vercel auto-detects Next.js — just
   click **Deploy**. You'll have a live `https://your-app.vercel.app` URL in
   about a minute, on Vercel's free Hobby tier.
3. Alternatively, without GitHub: install the Vercel CLI (`npm i -g vercel`),
   run `vercel` inside this folder, and follow the prompts to log in and
   deploy.

No environment variables or API keys are required — everything runs off free
public RSS feeds.

## Extending it

- **Add more sources**: add an entry to `FEEDS` in `lib/feeds.js` with a
  `region` of `india`, `eu`, or `global`.
- **Smarter summaries**: `toByteSummary()` in `lib/summarize.js` currently
  does simple sentence-extraction (no AI needed, works offline/free). If you
  want AI-tightened summaries instead, that function is the place to swap in
  a call to an LLM API.
- **More regions/tabs**: edit `REGIONS` in `lib/feeds.js` and the region
  styling in `components/NewsCard.js`.
