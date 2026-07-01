/* The product shot. `hasImage` is decided on the server (see app/page.tsx) by
   checking whether public/product-screenshot.png exists — deterministic, with no
   hydration race. Until a real screenshot is dropped in, we render a convincing
   mock of the Syrus Jobs dashboard so the hero never looks empty. */

const jobs = [
  {
    id: "#412",
    title: "Add token-bucket rate limiting to the API",
    meta: "Claude Code · workflow run 3",
    state: "Implementing",
    tone: "active",
  },
  {
    id: "#409",
    title: "Fix flaky authentication spec",
    meta: "PR #128 opened · 2 min ago",
    state: "PR opened",
    tone: "pr",
  },
  {
    id: "#402",
    title: "Bump dependencies to latest minor",
    meta: "PR #126 merged",
    state: "Merged",
    tone: "done",
  },
  {
    id: "#398",
    title: "Nightly documentation sweep",
    meta: "cron · every day 03:00",
    state: "Scheduled",
    tone: "idle",
  },
  {
    id: "#395",
    title: "Rebase feature/billing onto main",
    meta: "deterministic · no conflicts",
    state: "Rebasing",
    tone: "active",
  },
];

const toneStyles: Record<string, string> = {
  active: "bg-[#c96f4a]/15 text-[#e28a5c] ring-[#c96f4a]/30",
  pr: "bg-[#5b8bd0]/12 text-[#87aede] ring-[#5b8bd0]/25",
  done: "bg-[#5fa86a]/12 text-[#84c78d] ring-[#5fa86a]/25",
  idle: "bg-white/6 text-cream-dim ring-white/10",
};

const dotColor: Record<string, string> = {
  active: "#e28a5c",
  pr: "#87aede",
  done: "#84c78d",
  idle: "#8a7f6d",
};

function Placeholder() {
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-[#161009] to-[#120e09]">
      <div className="flex items-center justify-between border-b border-white/6 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="text-[0.9rem] font-semibold text-cream">Jobs</span>
          <span className="rounded-full bg-white/6 px-2 py-0.5 font-mono text-[0.68rem] text-cream-dim">
            acme/web
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-6 w-36 rounded-md bg-white/5" />
          <div className="size-6 rounded-full clay-gradient" />
        </div>
      </div>

      <div className="flex-1 divide-y divide-white/5 overflow-hidden">
        {jobs.map((j) => (
          <div
            key={j.id}
            className="flex items-center gap-4 px-5 py-[0.85rem] transition-colors hover:bg-white/[0.02]"
          >
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ background: dotColor[j.tone] }}
            />
            <span className="hidden w-10 shrink-0 font-mono text-[0.72rem] text-cream-faint sm:block">
              {j.id}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.82rem] font-medium text-cream">
                {j.title}
              </p>
              <p className="truncate font-mono text-[0.68rem] text-cream-faint">
                {j.meta}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[0.68rem] font-medium ring-1 ring-inset ${toneStyles[j.tone]}`}
            >
              {j.state}
            </span>
          </div>
        ))}
      </div>

      <div className="pointer-events-none flex items-center gap-1.5 border-t border-white/6 px-5 py-2.5 font-mono text-[0.65rem] text-cream-faint">
        <span className="size-1.5 rounded-full bg-[#84c78d]" />
        poller healthy · 5 jobs · 2 workers idle
      </div>
    </div>
  );
}

export function ScreenshotFrame({ hasImage = false }: { hasImage?: boolean }) {
  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-white/10 to-white/[0.02] p-[1.5px] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]">
      <div className="overflow-hidden rounded-[calc(1rem-1px)] border border-white/8 bg-ink-soft">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b border-white/6 bg-white/[0.02] px-4 py-2.5">
          <span className="flex gap-1.5">
            <span className="size-3 rounded-full bg-[#e06b52]/80" />
            <span className="size-3 rounded-full bg-[#e0a54a]/80" />
            <span className="size-3 rounded-full bg-[#84c78d]/80" />
          </span>
          <div className="mx-auto flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1 font-mono text-[0.68rem] text-cream-faint">
            <span className="size-1.5 rounded-full bg-[#84c78d]" />
            app.syrus-ai.dev
          </div>
        </div>

        <div className="aspect-[16/10] w-full">
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/product-screenshot.png"
              alt="The Syrus dashboard showing a list of automated jobs turning GitHub issues into pull requests."
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <Placeholder />
          )}
        </div>
      </div>
    </div>
  );
}
