import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const description =
  "Syrus is a self-hosted, multi-user harness that turns GitHub issues, review feedback, CI failures, and scheduled tasks into agent runs — then opens and keeps the pull request current. You keep the keys, the logs, and the audit trail.";

export const metadata: Metadata = {
  metadataBase: new URL("https://syrus-ai.dev"),
  title: {
    default: "Syrus — the agent writes the code, Syrus ships the PR",
    template: "%s · Syrus",
  },
  description,
  applicationName: "Syrus",
  keywords: [
    "Syrus",
    "issue to PR automation",
    "coding agent harness",
    "self-hosted",
    "Claude Code",
    "Codex",
    "GitHub automation",
  ],
  openGraph: {
    type: "website",
    url: "https://syrus-ai.dev",
    siteName: "Syrus",
    title: "Syrus — the agent writes the code, Syrus ships the PR",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Syrus — the agent writes the code, Syrus ships the PR",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#14110d",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
