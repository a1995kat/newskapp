export const runtime = "nodejs";

// MyMemory's free translation API — no API key or signup required. It has a
// modest anonymous daily quota, so this is best-effort: any item that fails
// or times out just falls back to its original English text rather than
// breaking the request.
async function translateText(text, target) {
  const trimmed = (text || "").trim();
  if (!trimmed) return "";
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      trimmed.slice(0, 480)
    )}&langpair=en|${target}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return trimmed;
    const json = await res.json();
    return json?.responseData?.translatedText || trimmed;
  } catch {
    return trimmed;
  }
}

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { items, target } = body || {};
  if (!Array.isArray(items) || !["de", "hi"].includes(target)) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  // Cap per request so one language switch doesn't fire off dozens of
  // concurrent calls against a free, rate-limited public API.
  const capped = items.slice(0, 12);

  const results = await Promise.all(
    capped.map(async (item) => {
      const [title, summary] = await Promise.all([
        translateText(item.title, target),
        translateText(item.summary, target)
      ]);
      return { id: item.id, title, summary };
    })
  );

  return Response.json(results);
}
