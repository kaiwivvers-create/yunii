import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const slugify = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/explore`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/compare`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/guides`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/chat`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/login`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/signup`, changeFrequency: "monthly", priority: 0.3 },
  ];

  // Live university pages — fetched from the backend at request time.
  let universityRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${process.env.BACKEND_URL || "http://localhost:7777"}/admin/universities`, {
      cache: "no-store",
    });
    if (res.ok) {
      const list = (await res.json()) as { name: string; updatedAt?: string }[];
      universityRoutes = list.map((u) => ({
        url: `${baseUrl}/university/${slugify(u.name)}`,
        lastModified: u.updatedAt ? new Date(u.updatedAt) : undefined,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch {
    // Backend offline — sitemap still works with static routes.
  }

  return [...staticRoutes, ...universityRoutes];
}
