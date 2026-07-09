import type { MetadataRoute } from "next";

const BASE = "https://syrus-ai.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
  ];
}
