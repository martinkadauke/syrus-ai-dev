import { Logo } from "./logo";
import { site } from "../lib/site";

type FooterLink = { label: string; href: string; external?: boolean };

const cols: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "#how" },
      { label: "Why Syrus", href: "#features" },
      { label: "Triggers", href: "#entry-points" },
    ],
  },
  {
    title: "Get started",
    links: [
      { label: "Download for Mac", href: site.macDownload, external: true },
      { label: "Request a demo", href: "#demo" },
    ],
  },
];

export function Footer() {
  const shortSha = site.build.sha.slice(0, 7);
  const year = 2026;

  return (
    <footer className="relative border-t border-white/8 py-14">
      <div className="wrap">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-[0.9rem] leading-relaxed text-cream-dim">
              AI across your delivery pipeline — with your git workflow, your
              reviews, and your final say kept fully intact.
            </p>
            <p className="mt-4 font-serif text-[0.92rem] italic text-cream-faint">
              {site.tagline}
            </p>
          </div>

          {cols.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h3 className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-cream-faint">
                {c.title}
              </h3>
              <ul className="mt-4 grid gap-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      {...(l.external
                        ? { target: "_blank", rel: "noreferrer" }
                        : {})}
                      className="text-[0.9rem] text-cream-dim transition-colors hover:text-cream"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/6 pt-6 sm:flex-row">
          <p className="text-[0.82rem] text-cream-faint">
            © {year} Syrus · {site.domain}
          </p>
          <span className="font-mono text-[0.72rem] text-cream-faint">
            build {shortSha}
          </span>
        </div>
      </div>
    </footer>
  );
}
