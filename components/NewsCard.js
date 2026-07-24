"use client";

import { useState } from "react";
import { Bookmark, Share2, Check } from "lucide-react";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const REGION_STYLES = {
  top: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  india: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  eu: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  global: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
};

const TOPIC_STYLES = {
  politics: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  business: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  tech: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
  science: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  sports: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300"
};

// Deterministic placeholder color from the source name, so cards without an
// image still look intentional instead of showing a broken/blank box.
function placeholderGradient(source) {
  let hash = 0;
  for (let i = 0; i < source.length; i++) hash = source.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 40) % 360} 70% 40%))`;
}

export default function NewsCard({ item, saved, onToggleSave }) {
  const [imgFailed, setImgFailed] = useState(false);
  const [shareState, setShareState] = useState("idle"); // idle | copied

  async function handleShare(e) {
    e.preventDefault();
    e.stopPropagation();
    const shareData = { title: item.title, url: item.link };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(item.link);
        setShareState("copied");
        setTimeout(() => setShareState("idle"), 1500);
      }
    } catch {
      // user cancelled share sheet — ignore
    }
  }

  const showImage = item.image && !imgFailed;

  return (
    <article className="animate-ink-in break-inside-avoid mb-6 rounded-xl border border-prophet-border dark:border-prophet-night-border bg-prophet-card dark:bg-prophet-night-card overflow-hidden flex flex-col transition-shadow hover:shadow-[0_6px_20px_rgba(92,26,27,0.18)] dark:hover:shadow-[0_6px_20px_rgba(201,162,39,0.15)]">
      <a href={item.link} target="_blank" rel="noopener noreferrer" className="group">
        <div className="w-full aspect-[16/9] relative overflow-hidden">
          {showImage ? (
            <img
              src={item.image}
              alt=""
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover grayscale-[15%] sepia-[10%] group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white/90 font-headline font-bold text-lg tracking-wide"
              style={{ background: placeholderGradient(item.source) }}
            >
              {item.source}
            </div>
          )}
        </div>

        <div className="p-4 pb-2">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                REGION_STYLES[item.region] || REGION_STYLES.global
              }`}
            >
              {item.region}
            </span>
            {item.topic && (
              <span
                className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                  TOPIC_STYLES[item.topic] || ""
                }`}
              >
                {item.topic}
              </span>
            )}
          </div>

          <p className="text-[11px] font-press text-prophet-muted dark:text-prophet-night-muted mb-2">
            {item.source} · {timeAgo(item.publishedAt)}
          </p>

          <h3 className="font-headline font-bold text-base leading-snug text-prophet-ink dark:text-prophet-night-ink group-hover:text-prophet-oxblood dark:group-hover:text-prophet-gold-bright transition-colors">
            {item.title}
          </h3>
          {item.summary && (
            <p className="font-parchment text-sm text-prophet-muted dark:text-prophet-night-muted mt-1.5 line-clamp-3">
              {item.summary}
            </p>
          )}
        </div>
      </a>

      <div className="px-4 pb-4 pt-1 flex items-center justify-between">
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="font-headline italic text-xs font-semibold text-prophet-oxblood dark:text-prophet-gold-bright hover:underline"
        >
          Read full story on {item.source} →
        </a>

        <div className="flex items-center gap-3.5 shrink-0">
          <button
            onClick={handleShare}
            aria-label="Share story"
            className="active:animate-sparkle flex items-center gap-1 text-prophet-muted dark:text-prophet-night-muted hover:text-prophet-oxblood dark:hover:text-prophet-gold-bright transition-colors"
            title="Share"
          >
            {shareState === "copied" ? (
              <>
                <Check size={17} strokeWidth={2} />
                <span className="text-xs font-medium">Copied</span>
              </>
            ) : (
              <Share2 size={17} strokeWidth={2} />
            )}
          </button>
          <button
            onClick={() => onToggleSave(item)}
            aria-label={saved ? "Remove bookmark" : "Save story"}
            className={`active:animate-sparkle transition-colors ${
              saved
                ? "text-prophet-oxblood dark:text-prophet-gold-bright"
                : "text-prophet-muted dark:text-prophet-night-muted hover:text-prophet-oxblood dark:hover:text-prophet-gold-bright"
            }`}
            title={saved ? "Saved" : "Save for later"}
          >
            <Bookmark size={18} strokeWidth={2} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </article>
  );
}
