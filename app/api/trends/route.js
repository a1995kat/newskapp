import Parser from "rss-parser";

export const runtime = "nodejs";
// Trending searches move much slower than headlines — a longer cache is fine.
export const revalidate = 1800;

const parser = new Parser({
  timeout: 7000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (compatible; ByteNewsBot/1.0; +https://example.com) RSS reader"
  },
  customFields: {
    item: [["ht:approx_traffic", "approxTraffic"]]
  }
});

// Google Trends' "Daily Search Trends" RSS feed, one per country code. This is
// Google Search trending queries, not a "Google News app" feed — Google News
// doesn't publish its own public trends feed — but it's the closest free,
// legitimate, no-key data source for "what's trending right now" and is
// labelled honestly as such in the UI.
const GEO_BY_REGION = {
  top: "US",
  global: "US",
  india: "IN",
  eu: "DE"
};

async function fetchTrends(geo) {
  try {
    const feed = await parser.parseURL(`https://trends.google.com/trending/rss?geo=${geo}`);
    return (feed.items || []).slice(0, 10).map((item) => ({
      term: item.title,
      traffic: item.approxTraffic || null
    }));
  } catch (err) {
    console.error(`[byte-news] Failed to fetch trends for ${geo}:`, err.message);
    return [];
  }
}

export async function GET() {
  const geos = [...new Set(Object.values(GEO_BY_REGION))];
  const results = await Promise.allSettled(geos.map(fetchTrends));
  const byGeo = {};
  geos.forEach((geo, i) => {
    byGeo[geo] = results[i].status === "fulfilled" ? results[i].value : [];
  });

  const byRegion = {};
  Object.entries(GEO_BY_REGION).forEach(([region, geo]) => {
    byRegion[region] = byGeo[geo] || [];
  });

  return Response.json(byRegion);
}
