import { cache } from "react";
import { API_BASE_URL } from "./seo";

// The detail endpoint returns the model without JSON tags, hence the PascalCase keys.
export type Blog = {
  ID: number;
  BlogID: string;
  BlogCategoryID: string;
  Title: string;
  ImageURL: string;
  Subtitle: string;
  BlogContent: string;
  CreatedAt?: string;
  UpdatedAt?: string;
};

/** One request per render, shared by generateMetadata and the page. */
export const getBlog = cache(async (id: string): Promise<Blog | undefined> => {
  try {
    const res = await fetch(`${API_BASE_URL}/public/blogs/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (!res.ok) return undefined;
    return ((await res.json()) as { data: Blog }).data;
  } catch {
    return undefined;
  }
});

export type BlogSummary = { blog_id: string; created_at: string; updated_at?: string };

/** Every published blog (id and dates), for the sitemap. */
export async function getAllBlogSummaries(): Promise<BlogSummary[]> {
  const out: BlogSummary[] = [];
  try {
    for (let page = 1; page <= 50; page++) {
      const res = await fetch(`${API_BASE_URL}/public/blogs/?page=${page}&limit=100`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const body = (await res.json()) as {
        data: BlogSummary[];
        pagination?: { total_pages: number };
      };
      out.push(...(body.data ?? []));
      if (page >= (body.pagination?.total_pages ?? 1)) break;
    }
  } catch {
    // an unreachable API just means fewer sitemap entries
  }
  return out;
}
