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
  "Syrus lets software teams put AI to work across the whole delivery pipeline — proposing epics, writing the code, reviewing the diff — without giving up the git workflow they trust. A developer approves every merge, so only world-class code ships.";

export const metadata: Metadata = {
  metadataBase: new URL("https://syrus-ai.dev"),
  title: {
    default: "Syrus — AI writes the code, your developers ship it",
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
    title: "Syrus — AI writes the code, your developers ship it",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Syrus — AI writes the code, your developers ship it",
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
