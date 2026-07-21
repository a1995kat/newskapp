import Parser from "rss-parser";
import { FEEDS, EU_KEYWORDS, MAX_ITEMS_PER_FEED } from "../../../lib/feeds";
import { toByteSummary, stripHtml } from "../../../lib/summarize";

export const runtime = "nodejs";
// Re-fetch feeds at most every 10 minutes (Next.js data cache).
export const revalidate = 600;

const parser = new Parser({
  timeout: 8000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (compatible; ByteNewsBot/1.0; +https://example.com) RSS reader"
  },
  // Media RSS namespace tags aren't parsed by default — map them explicitly
  // so we can pull thumbnail images out of feeds that use them (NYT, TOI, etc).
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail"]
    ]
  }
});

function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), ms)
  );
  return Promise.race([promise, timeout]);
}

function isEuropeRelated(item) {
  const text = `${item.title} ${item.summary}`.toLowerCase();
  return EU_KEYWORDS.some((kw) => text.includes(kw));
}

function dedupe(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = (item.link || item.title || "").trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Different feeds expose images in different ways (standard <enclosure>,
// Media RSS <media:content>/<media:thumbnail>, or just an <img> embedded in
// the HTML description). Try each in order until one works.
function extractImage(item) {
  if (item.enclosure?.url) return item.enclosure.url;

  const thumb = item.mediaThumbnail;
  if (thumb?.$?.url) return thumb.$.url;
  if (typeof thumb === "string" && thumb.startsWith("http")) return thumb;

  const mc = item.mediaContent;
  if (Array.isArray(mc)) {
    for (const m of mc) {
      const url = m?.$?.url || m?.url;
      if (url) return url;
    }
  } else if (mc?.$?.url) {
    return mc.$.url;
  }

  const html = item.content || item["content:encoded"] || item.summary || "";
  const match = /<img[^>]+src="([^"]+)"/i.exec(html);
  if (match) return match[1];

  return null;
}

async function fetchFeed(feed) {
  try {
    const parsed = await withTimeout(parser.parseURL(feed.url), 9000);
    const items = (parsed.items || []).slice(0, MAX_ITEMS_PER_FEED);
    return items.map((item) => {
      const title = stripHtml(item.title || "");
      const rawDesc = item.contentSnippet || item.content || item.summary || "";
      return {
        id: `${feed.id}-${item.guid || item.link || item.title}`,
        title,
        summary: toByteSummary(rawDesc, title),
        link: item.link,
        source: feed.source,
        region: feed.region,
        topic: feed.topic || null,
        publishedAt: item.isoDate || item.pubDate || null,
        image: extractImage(item)
      };
    });
  } catch (err) {
    console.error(`[byte-news] Failed to fetch ${feed.id}:`, err.message);
    return [];
  }
}

export async function GET() {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));
  const allItems = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));

  const cleanItems = allItems.filter((item) => item.title && item.summary);

  const india = dedupe(cleanItems.filter((i) => i.region === "india"));

  const eu = dedupe(
    cleanItems.filter(
      (i) => i.region === "eu" || (i.region === "global" && isEuropeRelated(i))
    )
  );

  const global = dedupe(cleanItems);

  const sortByDate = (arr) =>
    [...arr].sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));

  const fedCount = results.filter((r) => r.status === "fulfilled" && r.value.length > 0).length;

  return Response.json({
    generatedAt: new Date().toISOString(),
    feedsOk: fedCount,
    feedsTotal: FEEDS.length,
    india: sortByDate(india),
    eu: sortByDate(eu),
    global: sortByDate(global)
  });
}
