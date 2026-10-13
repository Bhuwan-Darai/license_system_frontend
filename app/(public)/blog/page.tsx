import type { Metadata } from "next";
import { API_BASE_URL } from "@/app/lib/seo";
import Blog from "@/app/components/LandingPage/Blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guides, tips and updates on getting your driving license in Nepal: registration, written exam, trial and more.",
  alternates: { canonical: "/blog" },
  openGraph: { url: "/blog", title: "Blog" },
};

async function getBlogs() {
  try {
    const res = await fetch(`${API_BASE_URL}/public/blogs/?page=1&limit=100`, {
      cache: "no-store",
    });

    if (!res.ok) return undefined;

    return await res.json();
  } catch {
    return undefined;
  }
}

// Rendered on the server for every request; search and category come from the URL.
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; category?: string | string[] }>;
}) {
  const params = await searchParams;
  const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) ?? "";

  const initialBlogs = await getBlogs();

  return (
    <Blog
      initialBlogs={initialBlogs}
      search={first(params.q).slice(0, 100)}
      category={first(params.category) || "All"}
    />
  );
}
