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
  "Syrus lets product, project, and application owners put AI to work across delivery — goals become tracked epics and tickets, AI does the heavy lifting, and a developer reviews every change. You ship more each sprint, with full visibility and no loss of control.";

export const metadata: Metadata = {
  metadataBase: new URL("https://syrus-ai.dev"),
  title: {
    default: "Syrus — ship more of your roadmap, fully in control",
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
    title: "Syrus — ship more of your roadmap, fully in control",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Syrus — ship more of your roadmap, fully in control",
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
      data-theme="cool"
      suppressHydrationWarning
      className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('syrus-theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}",
          }}
        />
        {children}
      </body>
    </html>
  );
}
