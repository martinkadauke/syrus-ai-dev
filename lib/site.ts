// Central configuration + copy for the Syrus marketing site.
// NEXT_PUBLIC_* values are inlined at build time; the "|| default" keeps the
// site fully functional with zero configuration.

export const site = {
  name: "Syrus",
  domain: "syrus-ai.dev",

  tagline: "Bis dat qui cito dat.",
  taglineTranslation: "He gives twice who gives quickly.",
  taglineAttribution: "— Publilius Syrus",

  macDownload:
    process.env.NEXT_PUBLIC_MAC_DOWNLOAD_URL ||
    "https://github.com/tkadauke/syrus/releases",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@syrus-ai.dev",

  web3formsKey: process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "",

  build: {
    sha: process.env.NEXT_PUBLIC_GIT_SHA || "dev",
    ref: process.env.NEXT_PUBLIC_GIT_REF || "local",
  },
} as const;

export const hero = {
  eyebrow: "Built for software teams",
  titleLead: "AI writes the code.",
  titleAccent: "Your developers ship it.",
  subtitle:
    "Syrus lets your team put AI to work across the whole delivery pipeline — proposing epics, writing the code, reviewing the diff — without giving up the issues, pull requests, and branch protection you already trust. Leads set the direction, a developer approves every merge, and only world-class code ships.",
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

// The product pillars.
export const features = [
  {
    id: "github",
    title: "Keep the git workflow you trust",
    body: "Issues, pull requests, reviews, checks, and branch protection keep working exactly as they do today. Syrus puts AI inside the loop your team already runs — no separate dashboard to migrate into, no process to relearn.",
  },
  {
    id: "approve",
    title: "A human approves every merge",
    body: "AI proposes the plan, writes the code, and critiques its own diff — but nothing lands without a developer's review and sign-off. You decide what's world-class; Syrus never bypasses your branch protection.",
  },
  {
    id: "keys",
    title: "Own the keys",
    body: "Bring your own GitHub and model credentials, encrypted at rest. The database, logs, transcripts, and clone caches all live inside your own infrastructure — a small, legible trust boundary.",
  },
  {
    id: "audit",
    title: "Keep a full audit trail",
    body: "Every epic, ticket, run, diff, transcript, and review is durable and attributable. Follow-ups, retries, and rebases append to the same thread — so you can always answer who, what, and why.",
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
  "Self-host with Docker Compose or Kubernetes",
  "Bring your own keys — GitHub and the model of your choice",
  "A developer reviews and approves every pull request",
  "Full transcript, diff, and audit trail for every run",
] as const;
