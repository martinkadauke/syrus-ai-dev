// Central configuration + copy for the Syrus marketing site.
// NEXT_PUBLIC_* values are inlined at build time; the "|| default" keeps the
// site fully functional with zero configuration.

export const site = {
  name: "Syrus",
  domain: "syrus-ai.dev",

  tagline: "Bis dat qui cito dat.",
  taglineTranslation: "He gives twice who gives quickly.",
  taglineAttribution: "— Publilius Syrus",

  // Served from the VM (see app/download/mac + the sync-desktop workflow), not
  // from the private GitHub repo. Redirects to the current versioned .dmg.
  macDownload: process.env.NEXT_PUBLIC_MAC_DOWNLOAD_URL || "/download/mac",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@syrus-ai.dev",

  web3formsKey: process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "",

  build: {
    sha: process.env.NEXT_PUBLIC_GIT_SHA || "dev",
    ref: process.env.NEXT_PUBLIC_GIT_REF || "local",
  },
} as const;

export const hero = {
  eyebrow: "Built for product & project owners",
  titleLead: "Do more with the team you have.",
  titleAccent: "Without losing sight of a thing.",
  subtitle:
    "Syrus lets product, project, and application owners put AI to work across delivery — turning your goals into tracked epics and tickets, letting AI do the heavy lifting, and keeping a developer's review on every change. More gets built with the same team, you see exactly what's shipping, and the guardrails keep AI's speed from becoming AI's mess.",
} as const;

// The human + AI team workflow — who does what, start to finish.
export const workflowSteps = [
  {
    who: "human",
    actor: "Leads & PMs",
    action: "Set the goal",
    note: "Describe the outcome you want in plain language — a feature, a fix, a refactor. No prompt engineering required.",
  },
  {
    who: "ai",
    actor: "Syrus AI",
    action: "Proposes epics & tickets",
    note: "Breaks the goal into scoped, reviewable issues your team can accept, edit, or reject before any code is written.",
  },
  {
    who: "human",
    actor: "Developers",
    action: "Pick up a ticket",
    note: "Assign it to Syrus with a trigger label — right inside the issue tracker your team already works in.",
  },
  {
    who: "ai",
    actor: "Syrus AI",
    action: "Writes the code",
    note: "Clones, branches, and implements in an isolated workspace, then opens a pull request with the full diff and transcript.",
  },
  {
    who: "both",
    actor: "Syrus AI + developer",
    action: "Review in tandem",
    note: "Syrus critiques its own diff and answers review comments; your developer brings the judgment machines can't.",
  },
  {
    who: "human",
    actor: "Developers",
    action: "Ship world-class code",
    note: "Only human-approved work gets merged. Your reviews, your branch protection, your standards — never bypassed.",
  },
] as const;

// The product pillars — framed for the owner who wants leverage with control.
export const features = [
  {
    id: "leverage",
    title: "Do more with the team you have",
    body: "Turn your roadmap into work AI can execute end to end. Your people shift from typing code to directing and reviewing it — so a small team ships like a much bigger one, without burning out or hiring up.",
  },
  {
    id: "approve",
    title: "AI speed, without the AI mess",
    body: "Every change runs through your real code review and branch protection. Nothing merges until a developer signs off — so AI's velocity never turns into hallucinated logic or low-quality features slipping into production.",
  },
  {
    id: "visibility",
    title: "See exactly what's being built",
    body: "Goals become tracked epics and tickets, and every run keeps its plan, diff, and review. You can follow what development is doing — and understand what each new feature actually is — without reading a line of code.",
  },
  {
    id: "keys",
    title: "Stay in control, on your terms",
    body: "Self-hosted, your keys, your existing git workflow. Nothing leaves your infrastructure and there's no new dashboard to migrate into — Syrus fits the process your team already trusts.",
  },
] as const;

// Every way work can start — one execution model, several entry points.
export const entryPoints = [
  {
    id: "issue",
    title: "Issue or ticket",
    body: "A labeled issue becomes a Job, a branch, and a pull request.",
  },
  {
    id: "feedback",
    title: "PR feedback",
    body: "A review comment triggers a follow-up commit on the same branch.",
  },
  {
    id: "ci",
    title: "CI failure",
    body: "A failing check kicks off a bounded, automatic repair attempt.",
  },
  {
    id: "direct",
    title: "Direct request",
    body: "An operator prompt with no ticket — chores, experiments, urgent work.",
  },
  {
    id: "scheduled",
    title: "Scheduled task",
    body: "Cron or one-shot runs for dependency chores, docs sweeps, hygiene.",
  },
  {
    id: "rebase",
    title: "Rebase",
    body: "An unmergeable branch gets a deterministic rebase — the agent only if judgment is needed.",
  },
] as const;

export const infraPoints = [
  "More shipped with the team you already have",
  "A developer reviews and approves every change",
  "Goals tracked as epics and tickets, end to end",
  "Self-hosted — your keys, your data, your git workflow",
] as const;
