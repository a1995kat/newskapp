// Central registry of free, publisher-provided RSS feeds.
// These are official syndication feeds meant for free public redistribution of
// headlines/summaries — NOT scraped paywalled article bodies. Full articles are
// never copied; we only show the headline + short public summary and link out
// to the original publisher for the full story.
//
// If a feed URL ever breaks (publishers change these occasionally), swap in a
// replacement here — everything downstream (parsing, categorizing, summarizing)
// stays the same.

export const FEEDS = [
  {
    id: "ht-india",
    source: "Hindustan Times",
    region: "india",
    url: "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml"
  },
  {
    id: "ht-world",
    source: "Hindustan Times",
    region: "global",
    url: "https://www.hindustantimes.com/feeds/rss/world-news/rssfeed.xml"
  },
  {
    id: "ft-europe",
    source: "Financial Times",
    region: "eu",
    url: "https://www.ft.com/world/europe?format=rss"
  },
  {
    id: "ft-world",
    source: "Financial Times",
    region: "global",
    url: "https://www.ft.com/world?format=rss"
  },
  {
    id: "nyt-world",
    source: "The New York Times",
    region: "global",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml"
  }
];

// Keywords used to also surface NYT World / FT World items that are
// specifically about Europe into the EU tab, since not every publisher has a
// dedicated Europe-only feed.
export const EU_KEYWORDS = [
  "europe", "european union", "eu ", "brussels", "eurozone", "nato",
  "france", "french", "germany", "german", "italy", "italian", "spain",
  "spanish", "uk", "britain", "british", "london", "poland", "polish",
  "ukraine", "russia", "netherlands", "belgium", "portugal", "greece",
  "sweden", "denmark", "ireland", "switzerland", "austria", "brexit"
];

export const REGIONS = [
  { key: "india", label: "India" },
  { key: "eu", label: "EU" },
  { key: "global", label: "Global" }
];
