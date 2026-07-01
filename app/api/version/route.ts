export const dynamic = "force-dynamic";

// Reports the exact commit baked into this container. The deploy job polls this
// and requires it to equal the pushed SHA — so a boot-crash that leaves the old
// image serving is caught instead of passing as a green deploy.
export function GET() {
  return Response.json(
    {
      sha: process.env.GIT_SHA ?? "unknown",
      ref: process.env.GIT_REF ?? "unknown",
      service: "syrus-ai.dev",
    },
    { headers: { "cache-control": "no-store" } },
  );
}
