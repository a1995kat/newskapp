// Central registry of free, publisher-provided RSS feeds.
// These are official syndication feeds meant for free public redistribution of
// headlines/summaries — NOT scraped paywalled article bodies. Full articles are
// never copied; we only show the headline + short public summary and link out
// to the original publisher for the full story.
//
// Each feed has a `region` (top | india | eu | global) controlling which main
// tab it feeds into, and an optional `topic` (politics | business | tech |
// science | sports) used by the topic filter chips within a tab. Feeds with
// no topic are "general" news.
//
// If a feed URL ever breaks (publishers change these occasionally), swap in a
// replacement here — everything downstream (parsing, categorizing, summarizing)
// stays the same.

export const FEEDS = [
  // --- Top Stories (cross-region "burning news" / most read / trending) ---
  {
    id: "nyt-top",
    source: "The New York Times",
    region: "top",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
  },
  {
    id: "ht-trending",
    source: "Hindustan Times",
    region: "top",
    url: "https://www.hindustantimes.com/feeds/rss/trending/rssfeed.xml"
  },
  {
    id: "toi-mostread",
    source: "Times of India",
    region: "top",
    url: "https://timesofindia.indiatimes.com/rssfeedmostread.cms"
  },

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
  {
    id: "ft-india-politics",
    source: "Financial Times",
    region: "india",
    topic: "politics",
    url: "https://www.ft.com/indian-politics-policy?format=rss"
  },
  {
    id: "toi-business",
    source: "Times of India",
    region: "india",
    topic: "business",
    url: "https://timesofindia.indiatimes.com/rssfeeds/1898055.cms"
  },
  {
    id: "toi-tech",
    source: "Times of India",
    region: "india",
    topic: "tech",
    url: "https://timesofindia.indiatimes.com/rssfeeds/66949542.cms"
  },
  {
    id: "toi-science",
    source: "Times of India",
    region: "india",
    topic: "science",
    url: "https://timesofindia.indiatimes.com/rssfeeds/-2128672765.cms"
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
  {
    id: "dw-germany",
    source: "Deutsche Welle",
    region: "eu",
    topic: "politics",
    url: "https://rss.dw.com/rdf/rss-en-ger"
  },
  {
    id: "dw-business",
    source: "Deutsche Welle",
    region: "eu",
    topic: "business",
    url: "https://rss.dw.com/rdf/rss-en-bus"
  },
  {
    id: "dw-science",
    source: "Deutsche Welle",
    region: "eu",
    topic: "science",
    url: "https://rss.dw.com/xml/rss_en_science"
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
    id: "nyt-politics",
    source: "The New York Times",
    region: "global",
    topic: "politics",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml"
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
    id: "nyt-science",
    source: "The New York Times",
    region: "global",
    topic: "science",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Science.xml"
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

// Keyword-based topic classification for articles coming from GENERAL feeds
// (e.g. Hindustan Times' or Times of India's main India feed) that mix every
// subject together with no topic tag of their own. Dedicated single-topic
// feeds (e.g. nyt-business) skip this and keep their explicit tag — this list
// only fills the gap for everything else, so a political story sitting inside
// a general feed still shows up under the Politics filter instead of being
// invisible outside "All".
//
// This is a plain, editable keyword list, not a trained model — if a story is
// mis-tagged or a whole category feels thin, just say "articles mentioning X
// should count as Y" and the relevant list below gets a new entry.
export const TOPIC_KEYWORDS = {
  politics: [
    "election", "elections", "parliament", "minister", "ministers", "government",
    "president", "prime minister", "cabinet", "opposition", "lok sabha",
    "rajya sabha", "senate", "congress party", "white house", "bjp", "modi",
    "governor", "chief minister", "legislation", "lawmaker", "ballot",
    "coalition", "diplomat", "geopolitic", "parliamentary", "mp ", "mla",
    "vote bank", "political party", "policy reform"
  ],
  business: [
    "economy", "economic", "market", "markets", "stock", "shares", "sensex",
    "nifty", "rbi", "inflation", "gdp", "trade deal", "tariff", "investment",
    "startup funding", "ipo", "merger", "acquisition", "earnings", "revenue",
    "quarterly profit", "corporate", "bank ", "banking", "finance minister",
    "financial results", "rupee", "dollar", "interest rate"
  ],
  tech: [
    "technology", "artificial intelligence", " ai model", " ai chip", "software",
    "smartphone", "gadget", "app store", "microchip", "semiconductor",
    "cybersecurity", "data breach", "robot", "computing", "silicon valley",
    "startup", "app update", "operating system"
  ],
  science: [
    "scientist", "scientists", "research team", "study finds", "nasa", "isro",
    "spacex", "space mission", "satellite", "climate change", "physics",
    "biology", "chemistry", "astronomy", "genome", "vaccine", "medical study",
    "discovery", "researchers"
  ],
  sports: [
    "cricket", "football", "soccer", "tennis", "olympic", "tournament",
    "world cup", "premier league", "nba", "ipl", "batsman", "bowler", "goal",
    "championship", "athlete", "medal", "wicket", "match", "fifa", "wimbledon"
  ]
};

// Order matters: checked top-to-bottom, first keyword match wins when a
// story could plausibly fit more than one bucket.
export const TOPIC_PRIORITY = ["politics", "business", "tech", "science", "sports"];

export const REGIONS = [
  { key: "top", label: "Top Stories" },
  { key: "india", label: "India" },
  { key: "eu", label: "EU" },
  { key: "global", label: "Global" }
];

export const TOPICS = [
  { key: "all", label: "All" },
  { key: "politics", label: "Politics" },
  { key: "business", label: "Business" },
  { key: "tech", label: "Tech" },
  { key: "science", label: "Science" },
  { key: "sports", label: "Sports" }
];

// Time-range filter, applied across every tab. Each entry (other than "all")
// is a cumulative "published within the last N hours" window, except
// "previous_day" which is deliberately the 24-48h band — i.e. "yesterday" as
// distinct from "today" — matching how people actually ask for it.
export const TIME_RANGES = [
  { key: "all", label: "All time" },
  { key: "1h", label: "Last 1h", maxAgeHours: 1 },
  { key: "5h", label: "Last 5h", maxAgeHours: 5 },
  { key: "24h", label: "Last 24h", maxAgeHours: 24 },
  { key: "previous_day", label: "Previous day", minAgeHours: 24, maxAgeHours: 48 }
];
