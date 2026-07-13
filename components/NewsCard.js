"use client";

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
  india: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  eu: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  global: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
};

export default function NewsCard({ item, saved, onToggleSave }) {
  return (
    <article className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
              REGION_STYLES[item.region] || REGION_STYLES.global
            }`}
          >
            {item.region}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{item.source}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            · {timeAgo(item.publishedAt)}
          </span>
        </div>
        <button
          onClick={() => onToggleSave(item)}
          aria-label={saved ? "Remove bookmark" : "Save story"}
          className="shrink-0 text-lg leading-none"
          title={saved ? "Saved" : "Save for later"}
        >
          {saved ? "★" : "☆"}
        </button>
      </div>

      <a href={item.link} target="_blank" rel="noopener noreferrer" className="group">
        <h3 className="font-bold text-base leading-snug group-hover:text-brand transition-colors">
          {item.title}
        </h3>
        {item.summary && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-3">
            {item.summary}
          </p>
        )}
      </a>

      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-semibold text-brand hover:underline self-start mt-1"
      >
        Read full story on {item.source} →
      </a>
    </article>
  );
}
