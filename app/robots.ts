import type { MetadataRoute } from "next";

// API-only host — nothing here should be indexed.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
