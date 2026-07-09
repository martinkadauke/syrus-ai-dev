import type { Metadata } from "next";

// This service hosts ONLY the Syrus API (the demo-form SMTP endpoint at
// /api/demo, plus /api/health and /api/version for the deploy). The website
// itself lives on GitHub Pages — see app/page.tsx, which redirects there.
export const metadata: Metadata = {
  title: "Syrus API",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
