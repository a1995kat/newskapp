"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import NewsCard from "./NewsCard";
import { REGIONS, TOPICS } from "../lib/feeds";

const TABS = [...REGIONS, { key: "saved", label: "Saved" }];
const SAVE_KEY = "byte-news:saved";
const THEME_KEY = "byte-news:theme";

export default function NewsApp() {
  const [data, setData] = useState({ india: [], eu: [], global: [], feedsOk: null, feedsTotal: null });
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState("global");
  const [topic, setTopic] = useState("all");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState([]);
  const [dark, setDark] = useState(false);

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
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter(
      (i) => i.title.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q)
    );
  }, [tab, topic, data, saved, query]);

  const liveLabel =
    data.feedsTotal != null ? `${data.feedsOk}/${data.feedsTotal} sources live` : null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-white/90 dark:bg-neutral-950/90 backdrop-blur border-b border-gray-200 dark:border-neutral-800">
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
        <nav className="max-w-3xl mx-auto px-4 pb-2 flex gap-2 overflow-x-auto">
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
        <div className="max-w-3xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto">
          {TOPICS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTopic(t.key)}
              className={`whitespace-nowrap text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
                topic === t.key
                  ? "border-brand text-brand"
                  : "border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-gray-400"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
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
            {tab === "saved" ? "No saved stories yet — tap ☆ on any card." : "No stories found."}
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

      <footer className="max-w-3xl w-full mx-auto px-4 py-6 text-xs text-gray-400 dark:text-gray-600">
        Headlines &amp; short summaries only, sourced from public RSS feeds (Hindustan Times,
        Times of India, Financial Times, The New York Times, Deutsche Welle). Tap any story to
        read the full article on the publisher's site.
      </footer>
    </div>
  );
}
