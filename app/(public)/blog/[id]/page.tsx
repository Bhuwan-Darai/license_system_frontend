import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { getBlog } from "@/app/lib/blogs";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, jsonLd, toDescription } from "@/app/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const blog = await getBlog(id);

  // unknown or unpublished: keep it out of search results
  if (!blog) return { title: "Blog not found", robots: { index: false, follow: false } };

  const description = toDescription(blog.Subtitle || blog.BlogContent);
  const image = blog.ImageURL || DEFAULT_OG_IMAGE;
  const path = `/blog/${blog.BlogID}`;

  return {
    title: blog.Title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      title: blog.Title,
      description,
      siteName: SITE_NAME,
      images: [{ url: image, alt: blog.Title }],
      publishedTime: blog.CreatedAt,
      modifiedTime: blog.UpdatedAt || blog.CreatedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.Title,
      description,
      images: [image],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const blog = await getBlog(id);

  if (!blog) {
    notFound();
  }

  const url = `${SITE_URL}/blog/${blog.BlogID}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.Title,
    description: toDescription(blog.Subtitle || blog.BlogContent),
    image: blog.ImageURL ? [blog.ImageURL] : undefined,
    datePublished: blog.CreatedAt,
    dateModified: blog.UpdatedAt || blog.CreatedAt,
    mainEntityOfPage: url,
    url,
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <main className="min-h-screen bg-ly-bg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      <article className="mx-auto w-full px-6 py-12 lg:w-[80%] lg:px-0">
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
            <time dateTime={blog.CreatedAt}>
              {blog.CreatedAt
                ? new Date(blog.CreatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                : "Published"}
            </time>
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
            quill-content prose prose-lg max-w-none
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
