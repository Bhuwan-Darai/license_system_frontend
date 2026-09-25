"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useI18n } from "@/app/context/LanguageContext";

type ApiBlog = {
  id: number;
  blog_id: string;
  category: {
    category_id: string;
    title: string;
  };
  title: string;
  cover_image: string;
  cover_image_path: string;
  subtitle: string;
  created_at: string;
  created_by?: string;
  updated_at?: string;
};

const CATEGORIES = [
  "All",
  "New License",
  "License",
  "License Process",
  "Exam Preparation",
  "Traffic Rules",
  "Trial Preparation",
];

function AdRail({ position }: { position: "left" | "right" }) {
  return (
    <aside
      className="
        hidden
        xl:flex
        w-[160px]
        shrink-0
        sticky
        top-28
        h-[600px]
        items-center
        justify-center
      "
    >
      <div
        className="
          w-full
          h-[600px]
          border
          border-dashed
          border-ly-gold/30
          rounded-2xl
          bg-ly-bg/40
          flex
          flex-col
          items-center
          justify-center
          text-center
          px-4
        "
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-ly-gold">
          Advertisement
        </span>

        <span className="text-xs text-ly-muted mt-2">Your advertisement</span>

        <span className="text-[10px] text-ly-muted/60 mt-1">160 × 600</span>
      </div>
    </aside>
  );
}

type BlogListResponse = {
  data: ApiBlog[];
  pagination?: {
    page: number;
    total_pages: number;
    [key: string]: unknown;
  };
  success?: boolean;
};

export default function Blog({
  initialBlogs,
}: {
  initialBlogs?: BlogListResponse;
} = {}) {
  const { m } = useI18n();

  console.log("initialBlogs", initialBlogs);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  // const { blog, isLoading, pagination, error } = useQueryDashboard(
  //   1,
  //   100,
  //   undefined,
  //   initialBlogs,
  // );

  /*
   * API:
   *
   * {
   *   data: [...]
   *   pagination: {...}
   *   success: true
   * }
   *
   * Depending on your hook implementation, `blog`
   * appears to already contain the `data` array.
   *

   */

  const blog = initialBlogs?.data;
  const blogs: ApiBlog[] = Array.isArray(blog) ? blog : [];

  const pagination = initialBlogs?.pagination;

  const filteredBlogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return blogs.filter((item) => {
      const blogCategory = item.category?.title || "";

      const matchesCategory = category === "All" || blogCategory === category;

      const matchesSearch =
        !query ||
        item.title?.toLowerCase().includes(query) ||
        item.subtitle?.toLowerCase().includes(query) ||
        blogCategory.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [blogs, search, category]);

  return (
    <section className="w-full bg-ly-surface">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-28">
        {/* =========================
            Header
        ========================== */}
        <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16">
          <p className="text-sm uppercase tracking-[0.18em] text-ly-brand mb-3">
            Likhit Yatra Journal
          </p>

          <h2 className="font-serif text-4xl sm:text-5xl text-ly-ink">
            Helpful guides for your Yatra.
          </h2>

          <p className="mt-5 text-ly-muted leading-relaxed">
            Simple guides, exam preparation tips, traffic rules, and useful
            information to help you along your license journey.
          </p>
        </div>

        {/* =========================
            Search / Filter
        ========================== */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  w-4
                  h-4
                  text-ly-muted
                "
              />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles..."
                className="
                  w-full
                  h-12
                  pl-11
                  pr-4
                  rounded-xl
                  border
                  border-ly-gold/20
                  bg-white
                  text-ly-ink
                  placeholder:text-ly-muted/60
                  outline-none
                  focus:border-ly-brand/50
                  transition-colors
                "
              />
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="
                h-12
                sm:w-56
                px-4
                rounded-xl
                border
                border-ly-gold/20
                bg-white
                text-ly-ink
                outline-none
                focus:border-ly-brand/50
                cursor-pointer
              "
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* =========================
            Content + Ad Rails
        ========================== */}
        <div className="flex justify-center items-start gap-8 xl:gap-10">
          {/* Left advertisement */}
          <AdRail position="left" />

          {/* =========================
              Blog Content
          ========================== */}
          <main className="w-full max-w-4xl">
            {/* Loading */}
            {filteredBlogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {filteredBlogs.map((item) => {
                  const blogCategory = item.category?.title || "General";

                  const date = new Date(item.created_at).toLocaleDateString(
                    "en-NP",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    },
                  );

                  /*
                   * Use blog_id as the URL identifier.
                   *
                   * Example:
                   * /blog/18507d25-bcce-4701-b8af-6e4f33ab8b4d
                   */
                  const href = `/blog/${item.blog_id}`;

                  return (
                    <article
                      key={item.blog_id}
                      className="
                        group
                        overflow-hidden
                        rounded-2xl
                        bg-white
                        border
                        border-ly-gold/15
                        transition-all
                        duration-300
                        hover:-translate-y-1
                        hover:shadow-[0_20px_50px_-25px_rgba(19,27,46,0.3)]
                      "
                    >
                      {/* Image */}
                      <Link href={href} className="block overflow-hidden">
                        <div className="relative aspect-[16/9] overflow-hidden bg-ly-bg">
                          {item.cover_image ? (
                            <Image
                              src={item.cover_image}
                              alt={item.title}
                              fill
                              sizes="
                                (max-width: 768px) 100vw,
                                (max-width: 1280px) 50vw,
                                500px
                              "
                              className="
                                object-cover
                                transition-transform
                                duration-500
                                group-hover:scale-105
                              "
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-sm text-ly-muted">
                                No image
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-center justify-between gap-4 mb-4">
                          <span className="text-xs uppercase tracking-[0.14em] text-ly-gold">
                            {blogCategory}
                          </span>

                          <span className="text-xs text-ly-muted">{date}</span>
                        </div>

                        {/* Title */}
                        <Link href={href}>
                          <h3
                            className="
                              font-serif
                              text-2xl
                              text-ly-ink
                              leading-tight
                              group-hover:text-ly-brand
                              transition-colors
                            "
                          >
                            {item.title}
                          </h3>
                        </Link>

                        {/* Subtitle */}
                        <p className="mt-3 text-sm text-ly-muted leading-relaxed">
                          {item.subtitle}
                        </p>

                        {/* Read article */}
                        <Link
                          href={href}
                          className="
                            inline-flex
                            items-center
                            gap-2
                            mt-5
                            text-sm
                            font-semibold
                            text-ly-brand-text
                          "
                        >
                          Read article
                          <ArrowRight
                            className="
                              w-4
                              h-4
                              transition-transform
                              duration-200
                              group-hover:translate-x-1
                            "
                          />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div
                className="
                  py-20
                  text-center
                  border
                  border-dashed
                  border-ly-gold/30
                  rounded-2xl
                "
              >
                <p className="font-serif text-2xl text-ly-ink">
                  No articles found.
                </p>

                <p className="mt-2 text-sm text-ly-muted">
                  Try another search or category.
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="flex justify-center mt-10">
                {/* Connect this to your API pagination */}
                <p className="text-sm text-ly-muted">
                  Page {pagination.page} of {pagination.total_pages}
                </p>
              </div>
            )}
          </main>

          {/* Right advertisement */}
          <AdRail position="right" />
        </div>
      </div>
    </section>
  );
}
