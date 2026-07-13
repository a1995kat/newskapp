"use client";

import { useEffect, useMemo, useState } from "react";
import NewsCard from "./NewsCard";
import { REGIONS } from "../lib/feeds";

const TABS = [...REGIONS, { key: "saved", label: "Saved" }];
const SAVE_KEY = "byte-news:saved";
const THEME_KEY = "byte-news:theme";

export default function NewsApp() {
  const [data, setData] = useState({ india: [], eu: [], global: [] });
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [tab, setTab] = useState("global");
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

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/news");
        if (!res.ok) throw new Error("bad response");
        const json = await res.json();
        if (!cancelled) {
          setData(json);
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }
    load();
    const interval = setInterval(load, 10 * 60 * 1000); // refresh every 10 min
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

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
    const base = tab === "saved" ? saved : data[tab] || [];
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter(
      (i) => i.title.toLowerCase().includes(q) || i.summary.toLowerCase().includes(q)
    );
  }, [tab, data, saved, query]);

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
          <button
            onClick={() => setDark((d) => !d)}
            className="text-sm px-3 py-1.5 rounded-full border border-gray-300 dark:border-neutral-700"
            aria-label="Toggle dark mode"
          >
            {dark ? "☀️ Light" : "🌙 Dark"}
          </button>
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
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-4 flex flex-col gap-3">
        {status === "loading" && (
          <p className="text-center text-sm text-gray-500 py-10">Fetching the latest bytes…</p>
        )}

        {status === "error" && (
          <p className="text-center text-sm text-red-500 py-10">
            Couldn't load news right now. Check your connection and refresh.
          </p>
        )}

        {status === "ready" && activeList.length === 0 && (
          <p className="text-center text-sm text-gray-500 py-10">
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
        Financial Times, The New York Times). Tap any story to read the full article on the
        publisher's site.
      </footer>
    </div>
  );
}
