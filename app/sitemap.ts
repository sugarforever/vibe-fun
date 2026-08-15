import type { MetadataRoute } from "next";
import { APPS } from "@/lib/apps";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE.url}/`, changeFrequency: "weekly", priority: 1 },
    ...APPS.map((a) => ({
      url: `${SITE.url}/play/${a.id}`,
      lastModified: new Date(`${a.updatedAt}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...["about", "contact", "privacy", "terms"].map((p) => ({
      url: `${SITE.url}/${p}`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
