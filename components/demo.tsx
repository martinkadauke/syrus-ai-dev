"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { ButtonLink } from "./button";
import { AppleIcon, ArrowRight, CheckIcon } from "./icons";
import { Reveal } from "./reveal";
import { infraPoints, site } from "../lib/site";

type Status = "idle" | "loading" | "success" | "error" | "mailto";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-[0.92rem] text-cream placeholder:text-cream-faint transition-colors focus:border-clay/50 focus:bg-white/[0.05] focus:outline-none";

export function Demo() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot — bail silently if a bot filled it.
    if (data.get("botcheck")) return;

    const name = String(data.get("name") || "");
    const email = String(data.get("email") || "");
    const company = String(data.get("company") || "");
    const message = String(data.get("message") || "");

    // No form backend configured yet → fall back to a prefilled email.
    if (!site.web3formsKey) {
      const body = encodeURIComponent(
        `Name: ${name}\nCompany: ${company}\nEmail: ${email}\n\n${message}`,
      );
      window.location.href = `mailto:${site.contactEmail}?subject=${encodeURIComponent(
        "Syrus demo request",
      )}&body=${body}`;
      setStatus("mailto");
      return;
    }

    setStatus("loading");
    setError("");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: site.web3formsKey,
          subject: "New Syrus demo request",
          from_name: "syrus-ai.dev",
          name,
          email,
          company,
          message,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setError(json.message || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setError("Network error. Please try again or email us directly.");
    }
  }

  return (
    <section id="demo" className="relative py-24 sm:py-32">
      {/* warm glow behind the band */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
        <div
          className="aurora left-1/2 top-1/2 h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 opacity-40"
          style={{
            background:
              "radial-gradient(closest-side, rgba(201,111,74,0.4), transparent)",
          }}
        />
      </div>

      <div className="wrap relative z-10">
        <Reveal className="mx-auto max-w-6xl">
          <div className="grid overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-ink-soft to-ink lg:grid-cols-2">
            {/* pitch + download */}
            <div className="border-b border-white/8 p-8 sm:p-11 lg:border-b-0 lg:border-r">
              <h2 className="text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.02em] text-cream sm:text-4xl">
                See Syrus running on{" "}
                <span className="clay-text">your roadmap.</span>
              </h2>
              <p className="mt-4 text-[1rem] leading-relaxed text-cream-dim">
                Download the Mac app to drive Syrus from your desktop, or request
                a guided demo — we&apos;ll show you how goals become tracked
                tickets, AI-written code, and reviewed pull requests, end to end.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={site.macDownload} variant="primary" size="lg">
                  <AppleIcon className="size-5" />
                  Download for Mac
                </ButtonLink>
                <ButtonLink href="#how" variant="secondary" size="lg">
                  See how it works
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </ButtonLink>
              </div>

              <ul className="mt-9 grid gap-3">
                {infraPoints.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2.5 text-[0.9rem] text-cream-dim"
                  >
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-clay" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            {/* demo form */}
            <div className="p-8 sm:p-11">
              {status === "success" ? (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
                  <span className="flex size-14 items-center justify-center rounded-full clay-gradient text-[#231208]">
                    <CheckIcon className="size-7" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-cream">
                    Request received
                  </h3>
                  <p className="mt-2 max-w-xs text-[0.92rem] text-cream-dim">
                    Thanks — we&apos;ll be in touch shortly to set up your Syrus
                    demo.
                  </p>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="grid gap-4">
                  <div>
                    <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-clay">
                      Request a demo
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-cream">
                      Tell us about your team
                    </h3>
                  </div>

                  {/* honeypot */}
                  <input
                    type="checkbox"
                    name="botcheck"
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-1.5">
                      <span className="text-[0.8rem] text-cream-dim">Name</span>
                      <input
                        name="name"
                        required
                        autoComplete="name"
                        placeholder="Ada Lovelace"
                        className={inputClass}
                      />
                    </label>
                    <label className="grid gap-1.5">
                      <span className="text-[0.8rem] text-cream-dim">Company</span>
                      <input
                        name="company"
                        autoComplete="organization"
                        placeholder="Acme Inc."
                        className={inputClass}
                      />
                    </label>
                  </div>

                  <label className="grid gap-1.5">
                    <span className="text-[0.8rem] text-cream-dim">Work email</span>
                    <input
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="ada@acme.com"
                      className={inputClass}
                    />
                  </label>

                  <label className="grid gap-1.5">
                    <span className="text-[0.8rem] text-cream-dim">
                      What would you like to automate?
                    </span>
                    <textarea
                      name="message"
                      rows={3}
                      placeholder="We want agents handling dependency bumps and CI repairs across ~20 repos…"
                      className={`${inputClass} resize-none`}
                    />
                  </label>

                  {status === "error" && (
                    <p className="text-[0.85rem] text-[#e28a5c]">{error}</p>
                  )}
                  {status === "mailto" && (
                    <p className="text-[0.85rem] text-cream-dim">
                      Opening your email client… if nothing happens, email{" "}
                      <a
                        className="text-clay underline underline-offset-2"
                        href={`mailto:${site.contactEmail}`}
                      >
                        {site.contactEmail}
                      </a>
                      .
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="group mt-1 inline-flex h-12 items-center justify-center gap-2.5 rounded-full clay-gradient px-5 text-[0.95rem] font-semibold text-[#231208] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-[1.06] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {status === "loading" ? "Sending…" : "Request a demo"}
                    {status !== "loading" && (
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    )}
                  </button>
                  <p className="text-center text-[0.75rem] text-cream-faint">
                    No spam. We only use this to arrange your demo.
                  </p>
                </form>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
