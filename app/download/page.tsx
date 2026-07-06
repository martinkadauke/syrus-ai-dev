import type { Metadata } from "next";
import { Nav } from "../../components/nav";
import { Footer } from "../../components/footer";
import { ButtonLink } from "../../components/button";
import { AppleIcon, WindowsIcon, DownloadIcon } from "../../components/icons";
import { listArtifacts, humanSize, type Artifact } from "../../lib/downloads";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Download",
  description:
    "Download the Syrus desktop app for macOS (Apple Silicon & Intel) and Windows.",
  alternates: { canonical: "/download" },
};

function PlatformIcon({ id }: { id: Artifact["id"] }) {
  return id === "mac" ? (
    <AppleIcon className="size-7 text-cream" />
  ) : (
    <WindowsIcon className="size-6 text-cream" />
  );
}

function Card({ art }: { art: Artifact }) {
  return (
    <article className="card flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
      <span className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
        <PlatformIcon id={art.id} />
      </span>

      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-semibold text-cream">{art.osLabel}</h2>
        <p className="mt-0.5 text-[0.9rem] text-cream-dim">
          {art.archLabel}
          {art.version ? ` · v${art.version}` : ""} · {humanSize(art.size)}
        </p>
        {art.sha256 ? (
          <p
            className="mt-2 truncate font-mono text-[0.68rem] text-cream-faint"
            title={art.sha256}
          >
            SHA-256 {art.sha256}
          </p>
        ) : null}
      </div>

      <ButtonLink
        href={`/download/${art.id}`}
        variant="primary"
        size="lg"
        className="w-full shrink-0 justify-center sm:w-auto"
      >
        <DownloadIcon className="size-[18px]" />
        Download
      </ButtonLink>
    </article>
  );
}

export default function DownloadPage() {
  const artifacts = listArtifacts();

  return (
    <>
      <Nav />
      <main id="main" className="wrap max-w-2xl pt-32 pb-24">
        <a
          href="/"
          className="text-[0.85rem] text-cream-dim transition-colors hover:text-cream"
        >
          ← Back to home
        </a>
        <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-cream">
          Download Syrus
        </h1>
        <p className="mt-4 text-pretty text-[1.02rem] leading-relaxed text-cream-dim">
          The Syrus desktop app for macOS and Windows. The macOS build is
          universal — one download runs natively on both Apple&nbsp;Silicon and
          Intel Macs.
        </p>

        {artifacts.length ? (
          <div className="mt-10 grid gap-4">
            {artifacts.map((art) => (
              <Card key={art.id} art={art} />
            ))}
          </div>
        ) : (
          <div className="card mt-10 p-8 text-center text-cream-dim">
            Downloads aren&rsquo;t available right now — please check back
            shortly.
          </div>
        )}

        <p className="mt-8 text-[0.85rem] text-cream-faint">
          By downloading, you agree to run Syrus on infrastructure you control.
          See our{" "}
          <a
            href="/privacy"
            className="text-clay underline underline-offset-2 hover:text-clay-bright"
          >
            privacy policy
          </a>
          .
        </p>
      </main>
      <Footer />
    </>
  );
}
