import type { MetadataRoute } from "next";
import { quality, site } from "../src/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: site.url, lastModified, changeFrequency: "monthly", priority: 1 },
    {
      url: `${site.url}/calculadora-cancer-pulmon`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // /calidad sólo entra al sitemap cuando está publicada (quality.publicada).
    ...(quality.publicada
      ? [
          {
            url: `${site.url}/calidad`,
            lastModified,
            changeFrequency: "yearly" as const,
            priority: 0.7,
          },
        ]
      : []),
    {
      url: `${site.url}/privacidad`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
