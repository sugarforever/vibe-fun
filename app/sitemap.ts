import type { MetadataRoute } from "next";
import { APPS } from "@/lib/apps";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE.url}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...APPS.map((a) => ({
      url: `${SITE.url}/play/${a.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...["about", "privacy", "terms"].map((p) => ({
      url: `${SITE.url}/${p}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
