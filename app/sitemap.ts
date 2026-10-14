import type { MetadataRoute } from "next";
import { getAllBlogSummaries } from "./lib/blogs";
import { SITE_URL } from "./lib/seo";

const PAGES: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
  { path: "/home", priority: 1, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.8, changeFrequency: "daily" },
  { path: "/services", priority: 0.7, changeFrequency: "monthly" },
  { path: "/pricing", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogs = await getAllBlogSummaries();

  return [
    ...PAGES.map((p) => ({
      url: `${SITE_URL}${p.path}`,
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),
    ...blogs.map((b) => ({
      url: `${SITE_URL}/blog/${b.blog_id}`,
      lastModified: new Date(b.updated_at || b.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
