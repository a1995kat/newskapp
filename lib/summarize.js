// Turns a raw RSS description (often HTML, sometimes long) into a short,
// "bytesize" 1-2 sentence blurb — similar to how apps like Indian Express's
// "Quick Reads" or Inshorts present stories.

function stripHtml(input) {
  if (!input) return "";
  return input
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lsquo;|&rsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&mdash;/g, "—")
    .replace(/\s+/g, " ")
    .trim();
}

// Splits into sentences (simple heuristic, good enough for news blurbs).
function splitSentences(text) {
  return text.match(/[^.!?]+[.!?]+/g) || [text];
}

// Strips trailing punctuation/whitespace so title-vs-sentence comparisons
// aren't thrown off by a trailing "." that only one of the two has.
function normalize(text) {
  return text.toLowerCase().replace(/[.!?…\s]+$/, "").trim();
}

export function toByteSummary(rawDescription, title, maxChars = 220) {
  const clean = stripHtml(rawDescription);
  if (!clean) return "";

  const normTitle = title ? normalize(title) : "";
  const sentences = splitSentences(clean);
  let summary = "";
  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    // Skip a leading sentence that just repeats (or near-repeats) the headline
    const normSentence = normalize(trimmed);
    if (
      normTitle &&
      (normSentence === normTitle ||
        normSentence.startsWith(normTitle) ||
        normTitle.startsWith(normSentence))
    ) {
      continue;
    }
    if ((summary + " " + trimmed).trim().length > maxChars) {
      if (!summary) summary = trimmed; // ensure at least one sentence
      break;
    }
    summary = (summary + " " + trimmed).trim();
  }

  if (summary.length > maxChars) {
    summary = summary.slice(0, maxChars).replace(/\s+\S*$/, "") + "…";
  } else if (summary && !/[.!?…]$/.test(summary)) {
    summary += "…";
  }

  return summary;
}

export { stripHtml };
