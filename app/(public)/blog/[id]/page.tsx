import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Tag } from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:3030/api/v1";

type Blog = {
  ID: number;
  BlogID: string;
  BlogCategoryID: string;
  Title: string;
  ImageURL: string;
  Subtitle: string;
  BlogContent: string;
};

type BlogResponse = {
  data: Blog;
  success?: boolean;
};

async function getBlogDetails(id: string): Promise<Blog | undefined> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/blogs/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return undefined;
    }

    const response: BlogResponse = await res.json();

    return response.data;
  } catch {
    return undefined;
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const blog = await getBlogDetails(id);

  if (!blog) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-ly-bg">
      <article className="mx-auto max-w-5xl px-6 py-12">
        {/* Back */}
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-2 text-sm text-ly-muted transition hover:text-ly-brand"
        >
          <ArrowLeft size={16} />
          Back to Blogs
        </Link>

        {/* Header */}
        <header className="mb-10">
          {/* Category */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-ly-brand/10 px-4 py-2 text-sm font-medium text-ly-brand">
            <Tag size={15} />
            License
          </div>

          {/* Title */}
          <h1 className="max-w-4xl text-4xl font-bold leading-tight text-ly-ink md:text-5xl">
            {blog.Title}
          </h1>

          {/* Subtitle */}
          {blog.Subtitle && (
            <p className="mt-5 max-w-3xl text-lg leading-8 text-ly-muted">
              {blog.Subtitle}
            </p>
          )}

          {/* Date */}
          <div className="mt-5 flex items-center gap-2 text-sm text-ly-muted">
            <Calendar size={16} />
            <span>Published</span>
          </div>
        </header>

        {/* Cover Image */}
        {blog.ImageURL && (
          <div className="relative mb-12 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-ly-surface">
            <img
              src={blog.ImageURL}
              alt={blog.Title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="
            prose prose-lg max-w-none
            prose-headings:text-ly-ink
            prose-p:text-ly-muted
            prose-p:leading-8
            prose-a:text-ly-brand
            prose-strong:text-ly-ink
            prose-li:text-ly-muted
            prose-blockquote:border-ly-brand
            prose-blockquote:text-ly-muted
            prose-img:rounded-xl
            prose-table:w-full
          "
          dangerouslySetInnerHTML={{
            __html: blog.BlogContent,
          }}
        />
      </article>
    </main>
  );
}
