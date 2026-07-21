// Central registry of free, publisher-provided RSS feeds.
// These are official syndication feeds meant for free public redistribution of
// headlines/summaries — NOT scraped paywalled article bodies. Full articles are
// never copied; we only show the headline + short public summary and link out
// to the original publisher for the full story.
//
// Each feed has a `region` (india | eu | global) controlling which main tab it
// feeds into, and an optional `topic` (business | tech | sports) used by the
// topic filter chips within a tab. Feeds with no topic are "general" news.
//
// If a feed URL ever breaks (publishers change these occasionally), swap in a
// replacement here — everything downstream (parsing, categorizing, summarizing)
// stays the same.

export const FEEDS = [
  // --- India ---
  {
    id: "ht-india",
    source: "Hindustan Times",
    region: "india",
    url: "https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml"
  },
  {
    id: "toi-india",
    source: "Times of India",
    region: "india",
    url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms"
  },
  {
    id: "ht-sports",
    source: "Hindustan Times",
    region: "india",
    topic: "sports",
    url: "https://www.hindustantimes.com/feeds/rss/sports/rssfeed.xml"
  },

  // --- EU ---
  {
    id: "ft-europe",
    source: "Financial Times",
    region: "eu",
    url: "https://www.ft.com/world/europe?format=rss"
  },
  {
    id: "dw-eu",
    source: "Deutsche Welle",
    region: "eu",
    url: "https://rss.dw.com/rdf/rss-en-all"
  },

  // --- Global ---
  {
    id: "ht-world",
    source: "Hindustan Times",
    region: "global",
    url: "https://www.hindustantimes.com/feeds/rss/world-news/rssfeed.xml"
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
  },
  {
    id: "nyt-business",
    source: "The New York Times",
    region: "global",
    topic: "business",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml"
  },
  {
    id: "ft-markets",
    source: "Financial Times",
    region: "global",
    topic: "business",
    url: "https://www.ft.com/markets?format=rss"
  },
  {
    id: "nyt-tech",
    source: "The New York Times",
    region: "global",
    topic: "tech",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml"
  },
  {
    id: "nyt-sports",
    source: "The New York Times",
    region: "global",
    topic: "sports",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml"
  }
];

// Max stories kept per feed after fetching (keeps payload small/fast and the
// "bytesize" feel — nobody wants to page through 100 headlines from one source).
export const MAX_ITEMS_PER_FEED = 20;

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

export const TOPICS = [
  { key: "all", label: "All" },
  { key: "business", label: "Business" },
  { key: "tech", label: "Tech" },
  { key: "sports", label: "Sports" }
];
