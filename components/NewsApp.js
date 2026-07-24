"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import NewsCard from "./NewsCard";
import { REGIONS, TOPICS, TIME_RANGES } from "../lib/feeds";

const TABS = [...REGIONS, { key: "saved", label: "Saved" }];
const SAVE_KEY = "byte-news:saved";
const THEME_KEY = "byte-news:theme";

// Icons for the mobile bottom nav (kept as emoji so no icon library/dependency
// is needed — consistent with the rest of the app's existing emoji controls).
const TAB_ICONS = {
  top: "🔥",
  india: "🇮🇳",
  eu: "🇪🇺",
  global: "🌐",
  saved: "⭐"
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
    } catch {
      // ignore malformed localStorage
    }
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
      <header className="sticky top-0 z-20 bg-white/90 dark:bg-neutral-950/90 backdrop-blur border-b border-gray-200 dark:border-neutral-800">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-brand text-2xl leading-none">●</span>
            <h1 className="font-extrabold text-xl tracking-tight">
              Byte<span className="text-brand">News</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {liveLabel && (
              <span
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"
                title="RSS sources responding successfully"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    data.feedsOk === data.feedsTotal ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                {liveLabel}
              </span>
            )}
            <button
              onClick={() => load({ silent: true })}
              disabled={refreshing}
              className="text-sm px-3 py-1.5 rounded-full border border-gray-300 dark:border-neutral-700 disabled:opacity-50"
              aria-label="Refresh"
              title="Refresh now"
            >
              {refreshing ? "⏳" : "🔄"}
            </button>
            <button
              onClick={() => setDark((d) => !d)}
              className="text-sm px-3 py-1.5 rounded-full border border-gray-300 dark:border-neutral-700"
              aria-label="Toggle dark mode"
            >
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 pb-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stories…"
            className="w-full rounded-full border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {/* Region tabs — desktop/tablet only. Mobile uses the bottom nav instead. */}
        <nav className="hidden sm:flex max-w-3xl mx-auto px-4 pb-3 gap-2 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap text-sm font-semibold px-4 py-1.5 rounded-full transition-colors ${
                tab === t.key
                  ? "bg-brand text-white"
                  : "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Grouped filter dropdowns — Category and Time — used on both mobile and desktop. */}
        <div className="max-w-3xl mx-auto px-4 pb-3 flex gap-2">
          <div className="relative">
            <button
              onClick={() => toggleDropdown("category")}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                topic !== "all"
                  ? "border-brand text-brand"
                  : "border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-gray-300"
              }`}
            >
              Category: {activeTopicLabel}
              <span className="text-[10px]">▾</span>
            </button>
            {openDropdown === "category" && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setOpenDropdown(null)} />
                <div className="absolute left-0 top-full mt-1 z-30 w-44 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg py-1">
                  {TOPICS.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => {
                        setTopic(t.key);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left text-sm px-3 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 ${
                        topic === t.key ? "font-semibold text-brand" : "text-gray-700 dark:text-gray-300"
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
                  ? "border-brand text-brand"
                  : "border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-gray-300"
              }`}
            >
              Time: {activeTimeLabel}
              <span className="text-[10px]">▾</span>
            </button>
            {openDropdown === "time" && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setOpenDropdown(null)} />
                <div className="absolute left-0 top-full mt-1 z-30 w-44 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-lg py-1">
                  {TIME_RANGES.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => {
                        setTimeRange(t.key);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left text-sm px-3 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800 ${
                        timeRange === t.key ? "font-semibold text-brand" : "text-gray-700 dark:text-gray-300"
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

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-4 pb-24 sm:pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
        {status === "loading" && (
          <p className="col-span-full text-center text-sm text-gray-500 py-10">
            Fetching the latest bytes…
          </p>
        )}

        {status === "error" && (
          <p className="col-span-full text-center text-sm text-red-500 py-10">
            Couldn't load news right now. Check your connection and refresh.
          </p>
        )}

        {status === "ready" && activeList.length === 0 && (
          <p className="col-span-full text-center text-sm text-gray-500 py-10">
            {tab === "saved" ? "No saved stories yet — tap ☆ on any card." : "No stories match these filters."}
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

      <footer className="hidden sm:block max-w-3xl w-full mx-auto px-4 py-6 text-xs text-gray-400 dark:text-gray-600">
        Headlines &amp; short summaries only, sourced from public RSS feeds (Hindustan Times,
        Times of India, Financial Times, The New York Times, Deutsche Welle). Tap any story to
        read the full article on the publisher's site.
      </footer>

      {/* Bottom nav — mobile only. Desktop uses the horizontal tabs in the header instead. */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-20 bg-white/95 dark:bg-neutral-950/95 backdrop-blur border-t border-gray-200 dark:border-neutral-800 flex">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
              tab === t.key ? "text-brand" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <span className="text-lg leading-none">{TAB_ICONS[t.key]}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
