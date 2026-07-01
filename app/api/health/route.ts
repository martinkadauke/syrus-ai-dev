export const dynamic = "force-dynamic";

// Liveness probe used by the Docker HEALTHCHECK and compose `up --wait`.
export function GET() {
  return new Response("ok", {
    status: 200,
    headers: { "content-type": "text/plain", "cache-control": "no-store" },
  });
}
