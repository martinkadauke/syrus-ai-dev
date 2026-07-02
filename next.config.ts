import type { NextConfig } from "next";

// Baseline security headers. Applied only in production so local dev (HMR
// websockets, etc.) is untouched. The site is fully static with no auth or
// cookies, so this is defense-in-depth hardening.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle so the Docker runtime image stays tiny.
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  // GIT_SHA / GIT_REF are injected as Docker build args (see Dockerfile) and
  // surfaced to the client for the footer build stamp. The runtime source of
  // truth for the deploy-verification check is /api/version (reads process.env).
  env: {
    NEXT_PUBLIC_GIT_SHA: process.env.GIT_SHA ?? "dev",
    NEXT_PUBLIC_GIT_REF: process.env.GIT_REF ?? "local",
  },
  async headers() {
    if (process.env.NODE_ENV !== "production") return [];
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
