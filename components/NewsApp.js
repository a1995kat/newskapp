"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Flame,
  MapPin,
  Landmark,
  Globe2,
  Bookmark,
  RefreshCw,
  Sun,
  Moon,
  ChevronDown,
  Search,
  Clock,
  TrendingUp
} from "lucide-react";
import NewsCard from "./NewsCard";
import { REGIONS, TOPICS, TIME_RANGES } from "../lib/feeds";

const TABS = [...REGIONS, { key: "saved", label: "Saved" }];
const SAVE_KEY = "byte-news:saved";
const THEME_KEY = "byte-news:theme";
const RECENT_SEARCH_KEY = "byte-news:recent-searches";

// Common low-signal words to skip when deriving "trending" keywords from
// today's actual headlines (see trendingKeywords below).
const STOPWORDS = new Set([
  "the", "a", "an", "to", "of", "in", "on", "for", "and", "is", "are", "with",
  "as", "at", "by", "from", "after", "over", "amid", "its", "his", "her",
  "this", "that", "new", "says", "how", "why", "what", "into", "your", "who",
  "will", "has", "have", "been", "was", "were", "than", "more", "not"
]);

// Single, consistent icon set (lucide) used everywhere — mobile bottom nav,
// desktop tabs, and controls — instead of mixed emoji. Each is a plain
// outline glyph that fills solid (via the `fill` prop) when its tab/state is
// active, matching the filled/outline pairing used in iOS-style tab bars.
const TAB_ICON_COMPONENTS = {
  top: Flame,
  india: MapPin,
  eu: Landmark,
  global: Globe2,
  saved: Bookmark
};

export default function NewsApp() {
  const [data, setData] = useState({
    top: [],
    india: [],
    eu: [],
    global: [],
    feedsOk: null,
    feedsTotal: null
  });
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState("top");
  const [topic, setTopic] = useState("all");
  const [timeRange, setTimeRange] = useState("all");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState([]);
  const [dark, setDark] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null); // null | "category" | "time"
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const searchInputRef = useRef(null);

  // Load saved bookmarks + theme preference from localStorage on mount.
  useEffect(() => {
    try {
      const storedSaved = JSON.parse(localStorage.getItem(SAVE_KEY) || "[]");
      setSaved(storedSaved);
      const storedTheme = localStorage.getItem(THEME_KEY);
      const prefersDark =
        storedTheme === "dark" ||
        (!storedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
      setDark(prefersDark);
      const storedRecent = JSON.parse(localStorage.getItem(RECENT_SEARCH_KEY) || "[]");
      setRecentSearches(storedRecent);
    } catch {
      // ignore malformed localStorage
    }
    setIsMac(/Mac|iPhone|iPad|iPod/.test(window.navigator.platform || window.navigator.userAgent));
  }, []);

  // Cmd/Ctrl+K jumps straight to the search bar from anywhere in the app.
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  }, [dark]);

  const load = useCallback(async ({ silent } = {}) => {
    if (silent) setRefreshing(true);
    try {
      const res = await fetch("/api/news", { cache: "no-store" });
      if (!res.ok) throw new Error("bad response");
      const json = await res.json();
      setData(json);
      setStatus("ready");
    } catch {
      setStatus((prev) => (prev === "ready" ? "ready" : "error"));
    } finally {
      if (silent) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) await load();
    })();
    const interval = setInterval(() => load({ silent: true }), 10 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [load]);

  function toggleSave(item) {
    setSaved((prev) => {
      const exists = prev.some((s) => s.id === item.id);
      const next = exists ? prev.filter((s) => s.id !== item.id) : [item, ...prev];
      localStorage.setItem(SAVE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function commitSearch(term) {
    const trimmed = term.trim();
    setQuery(trimmed);
    setSearchOpen(false);
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const next = [
        trimmed,
        ...prev.filter((t) => t.toLowerCase() !== trimmed.toLowerCase())
      ].slice(0, 6);
      localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(next));
      return next;
    });
  }

  function clearRecentSearches() {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCH_KEY);
  }

  // Real "trending" words pulled from today's actual Top Stories headlines
  // (not a fabricated list) — the most-repeated significant words across
  // current top-tab stories, so it reflects what's genuinely being covered.
  const trendingKeywords = useMemo(() => {
    const counts = {};
    (data.top || []).forEach((item) => {
      (item.title || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .forEach((word) => {
          if (word.length < 4 || STOPWORDS.has(word)) return;
          counts[word] = (counts[word] || 0) + 1;
        });
    });
    return Object.entries(counts)
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([word]) => word[0].toUpperCase() + word.slice(1));
  }, [data.top]);

  const savedIds = useMemo(() => new Set(saved.map((s) => s.id)), [saved]);

  const activeList = useMemo(() => {
    let base = tab === "saved" ? saved : data[tab] || [];
    if (topic !== "all") base = base.filter((i) => i.topic === topic);

    if (timeRange !== "all") {
      const range = TIME_RANGES.find((r) => r.key === timeRange);
      const now = Date.now();
      base = base.filter((i) => {
        if (!i.publishedAt) return false;
        const ageHours = (now - new Date(i.publishedAt).getTime()) / 3600000;
        if (ageHours < 0) return false;
        if (range.minAgeHours != null && ageHours < range.minAgeHours) return false;
        if (range.maxAgeHours != null && ageHours > range.maxAgeHours) return false;
        return true;
      });
    }

    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter(
      (i) => i.title.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q)
    );
  }, [tab, topic, timeRange, data, saved, query]);

  const liveLabel =
    data.feedsTotal != null ? `${data.feedsOk}/${data.feedsTotal} sources live` : null;

  const activeTopicLabel = TOPICS.find((t) => t.key === topic)?.label || "All";
  const activeTimeLabel = TIME_RANGES.find((t) => t.key === timeRange)?.label || "All time";

  function toggleDropdown(name) {
    setOpenDropdown((prev) => (prev === name ? null : name));
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 bg-prophet-parchment/95 dark:bg-prophet-night/95 backdrop-blur border-b border-prophet-border dark:border-prophet-night-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <div className="absolute inset-0 -z-10 rounded-full bg-prophet-gold/30 dark:bg-prophet-gold-bright/25 blur-md animate-glow" />
              <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden="true">
                <defs>
                  <clipPath id="logoClip">
                    <rect width="64" height="64" rx="14" />
                  </clipPath>
                </defs>
                <g clipPath="url(#logoClip)">
                  <rect width="64" height="64" fill="#5c1a1b" />
                  <polygon points="64,0 64,64 0,64" fill="#2c221e" />
                </g>
                <rect x="24" y="10" width="16" height="26" rx="8" fill="#f4ecd8" />
                <path
                  d="M18 28v4c0 7.7 6.3 14 14 14s14-6.3 14-14v-4"
                  fill="none"
                  stroke="#f4ecd8"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
                <line x1="32" y1="46" x2="32" y2="53" stroke="#f4ecd8" strokeWidth="4.5" strokeLinecap="round" />
                <line x1="22" y1="53" x2="42" y2="53" stroke="#f4ecd8" strokeWidth="4.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="leading-tight">
              <h1 className="font-display shimmer-text animate-shimmer text-2xl sm:text-[28px] tracking-wide">
                ByteNews
              </h1>
              <p className="hidden sm:block font-headline italic text-[11px] text-prophet-muted dark:text-prophet-night-muted -mt-1">
                Headlines, delivered by owl or by byte
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {liveLabel && (
              <span
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-press text-prophet-muted dark:text-prophet-night-muted"
                title="RSS sources responding successfully"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    data.feedsOk === data.feedsTotal ? "bg-emerald-600" : "bg-prophet-gold-bright"
                  }`}
                />
                {liveLabel}
              </span>
            )}
            <button
              onClick={() => load({ silent: true })}
              disabled={refreshing}
              className={`p-2 rounded-full border border-prophet-border dark:border-prophet-night-border disabled:opacity-50 transition-colors ${
                refreshing
                  ? "text-prophet-gold-bright"
                  : "text-prophet-muted dark:text-prophet-night-muted hover:text-prophet-oxblood dark:hover:text-prophet-gold-bright"
              }`}
              aria-label="Refresh"
              title="Refresh now"
            >
              <RefreshCw size={16} strokeWidth={2} className={refreshing ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => setDark((d) => !d)}
              className="p-2 rounded-full border border-prophet-border dark:border-prophet-night-border text-prophet-muted dark:text-prophet-night-muted hover:text-prophet-oxblood dark:hover:text-prophet-gold-bright transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-3">
          <div className="relative">
            <Search
              size={16}
              strokeWidth={2}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-prophet-muted dark:text-prophet-night-muted"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) {
                  commitSearch(query);
                  searchInputRef.current?.blur();
                } else if (e.key === "Escape") {
                  setSearchOpen(false);
                  searchInputRef.current?.blur();
                }
              }}
              placeholder="Search stories…"
              className="w-full rounded-full border border-prophet-border dark:border-prophet-night-border bg-prophet-card dark:bg-prophet-night-card text-prophet-ink dark:text-prophet-night-ink font-parchment pl-9 pr-14 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-prophet-oxblood dark:focus:ring-prophet-gold-bright"
            />
            <kbd className="hidden sm:flex items-center gap-0.5 absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-press font-medium text-prophet-muted dark:text-prophet-night-muted border border-prophet-border dark:border-prophet-night-border rounded px-1.5 py-0.5 pointer-events-none">
              {isMac ? "⌘K" : "Ctrl K"}
            </kbd>

            {searchOpen && !query.trim() && (recentSearches.length > 0 || trendingKeywords.length > 0) && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setSearchOpen(false)} />
                <div className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-lg border border-prophet-border dark:border-prophet-night-border bg-prophet-card dark:bg-prophet-night-card shadow-lg py-2 max-h-80 overflow-y-auto">
                  {recentSearches.length > 0 && (
                    <div className="px-3 pb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-press font-semibold uppercase tracking-wide text-prophet-muted dark:text-prophet-night-muted">
                          Recent
                        </span>
                        <button
                          onClick={clearRecentSearches}
                          className="text-[11px] text-prophet-muted dark:text-prophet-night-muted hover:text-prophet-oxblood dark:hover:text-prophet-gold-bright"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="flex flex-col">
                        {recentSearches.map((term) => (
                          <button
                            key={term}
                            onClick={() => commitSearch(term)}
                            className="flex items-center gap-2 text-left text-sm font-parchment px-2 py-1.5 rounded-md hover:bg-prophet-parchment dark:hover:bg-prophet-night text-prophet-ink dark:text-prophet-night-ink"
                          >
                            <Clock size={13} strokeWidth={2} className="text-prophet-muted dark:text-prophet-night-muted shrink-0" />
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {trendingKeywords.length > 0 && (
                    <div
                      className={`px-3 pt-1 ${
                        recentSearches.length > 0
                          ? "border-t border-prophet-border dark:border-prophet-night-border"
                          : ""
                      }`}
                    >
                      <span className="text-[11px] font-press font-semibold uppercase tracking-wide text-prophet-muted dark:text-prophet-night-muted mb-1.5 block pt-1">
                        Trending now
                      </span>
                      <div className="flex flex-wrap gap-1.5 pb-1">
                        {trendingKeywords.map((word) => (
                          <button
                            key={word}
                            onClick={() => commitSearch(word)}
                            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-prophet-parchment dark:bg-prophet-night text-prophet-muted dark:text-prophet-night-muted hover:bg-prophet-oxblood hover:text-prophet-card dark:hover:bg-prophet-gold-bright dark:hover:text-prophet-night transition-colors"
                          >
                            <TrendingUp size={12} strokeWidth={2} />
                            {word}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Region tabs — desktop/tablet only. Mobile uses the bottom nav instead. */}
        <nav className="hidden sm:flex max-w-6xl mx-auto px-4 pb-3 gap-2 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = TAB_ICON_COMPONENTS[t.key];
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 whitespace-nowrap font-headline font-semibold text-sm px-4 py-1.5 rounded-full transition-colors ${
                  active
                    ? "bg-prophet-oxblood text-prophet-card dark:bg-prophet-gold-bright dark:text-prophet-night"
                    : "bg-prophet-card dark:bg-prophet-night-card text-prophet-muted dark:text-prophet-night-muted"
                }`}
              >
                <Icon size={15} strokeWidth={2} fill={active ? "currentColor" : "none"} />
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Grouped filter dropdowns — Category and Time — used on both mobile and desktop. */}
        <div className="max-w-6xl mx-auto px-4 pb-3 flex gap-2">
          <div className="relative">
            <button
              onClick={() => toggleDropdown("category")}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                topic !== "all"
                  ? "border-prophet-oxblood text-prophet-oxblood dark:border-prophet-gold-bright dark:text-prophet-gold-bright"
                  : "border-prophet-border dark:border-prophet-night-border text-prophet-muted dark:text-prophet-night-muted"
              }`}
            >
              Category: {activeTopicLabel}
              <ChevronDown size={12} strokeWidth={2.5} />
            </button>
            {openDropdown === "category" && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setOpenDropdown(null)} />
                <div className="absolute left-0 top-full mt-1 z-30 w-44 rounded-lg border border-prophet-border dark:border-prophet-night-border bg-prophet-card dark:bg-prophet-night-card shadow-lg py-1">
                  {TOPICS.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => {
                        setTopic(t.key);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left text-sm px-3 py-2 hover:bg-prophet-parchment dark:hover:bg-prophet-night ${
                        topic === t.key
                          ? "font-semibold text-prophet-oxblood dark:text-prophet-gold-bright"
                          : "text-prophet-ink dark:text-prophet-night-ink"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => toggleDropdown("time")}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                timeRange !== "all"
                  ? "border-prophet-oxblood text-prophet-oxblood dark:border-prophet-gold-bright dark:text-prophet-gold-bright"
                  : "border-prophet-border dark:border-prophet-night-border text-prophet-muted dark:text-prophet-night-muted"
              }`}
            >
              Time: {activeTimeLabel}
              <ChevronDown size={12} strokeWidth={2.5} />
            </button>
            {openDropdown === "time" && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setOpenDropdown(null)} />
                <div className="absolute left-0 top-full mt-1 z-30 w-44 rounded-lg border border-prophet-border dark:border-prophet-night-border bg-prophet-card dark:bg-prophet-night-card shadow-lg py-1">
                  {TIME_RANGES.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => {
                        setTimeRange(t.key);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left text-sm px-3 py-2 hover:bg-prophet-parchment dark:hover:bg-prophet-night ${
                        timeRange === t.key
                          ? "font-semibold text-prophet-oxblood dark:text-prophet-gold-bright"
                          : "text-prophet-ink dark:text-prophet-night-ink"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-5 pb-24 sm:pb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-6 items-start">
        {status === "loading" && (
          <p className="col-span-full text-center text-sm font-headline italic text-prophet-muted dark:text-prophet-night-muted py-10">
            Summoning the latest headlines…
          </p>
        )}

        {status === "error" && (
          <p className="col-span-full text-center text-sm text-prophet-oxblood dark:text-prophet-gold-bright py-10">
            The ink well ran dry — check your connection and refresh.
          </p>
        )}

        {status === "ready" && activeList.length === 0 && (
          <p className="col-span-full flex items-center justify-center gap-1.5 text-center text-sm text-prophet-muted dark:text-prophet-night-muted py-10">
            {tab === "saved" ? (
              <>
                No saved stories yet — tap <Bookmark size={14} strokeWidth={2} className="inline" /> on
                any card.
              </>
            ) : (
              "No stories match these filters."
            )}
          </p>
        )}

        {activeList.map((item) => (
          <NewsCard
            key={item.id}
            item={item}
            saved={savedIds.has(item.id)}
            onToggleSave={toggleSave}
          />
        ))}
      </main>

      <footer className="hidden sm:block max-w-6xl w-full mx-auto px-4 py-6 text-xs font-press text-prophet-muted dark:text-prophet-night-muted">
        Headlines &amp; short summaries only, printed fresh from public RSS feeds (Hindustan Times,
        Times of India, Financial Times, The New York Times, Deutsche Welle). Tap any story to
        read the full article on the publisher's site.
      </footer>

      {/* Bottom nav — mobile only. Desktop uses the horizontal tabs in the header instead. */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-20 bg-prophet-card/95 dark:bg-prophet-night-card/95 backdrop-blur border-t border-prophet-border dark:border-prophet-night-border flex">
        {TABS.map((t) => {
          const Icon = TAB_ICON_COMPONENTS[t.key];
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-headline font-medium transition-colors ${
                active
                  ? "text-prophet-oxblood dark:text-prophet-gold-bright"
                  : "text-prophet-muted dark:text-prophet-night-muted"
              }`}
            >
              <Icon size={21} strokeWidth={2} fill={active ? "currentColor" : "none"} />
              {t.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
