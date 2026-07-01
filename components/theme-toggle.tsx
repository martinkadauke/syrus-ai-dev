"use client";

import { useEffect, useState } from "react";

const THEMES = [
  { id: "cool", label: "Cool", dot: "#5b95f7" },
  { id: "warm", label: "Warm", dot: "#c96f4a" },
] as const;

const STORAGE_KEY = "syrus-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState("cool");

  // Sync from whatever the pre-paint script already applied to <html>.
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme || "cool");
  }, []);

  function pick(id: string) {
    document.documentElement.dataset.theme = id;
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore storage errors */
    }
    setTheme(id);
  }

  return (
    <div className="flex items-center gap-2.5">
      <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-cream-faint">
        Theme
      </span>
      <div
        role="group"
        aria-label="Color theme"
        className="inline-flex rounded-full border border-white/10 bg-white/[0.03] p-0.5"
      >
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => pick(t.id)}
            aria-pressed={theme === t.id}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.75rem] font-medium transition-colors ${
              theme === t.id
                ? "bg-white/10 text-cream"
                : "text-cream-dim hover:text-cream"
            }`}
          >
            <span
              className="size-2 rounded-full"
              style={{ background: t.dot }}
            />
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
