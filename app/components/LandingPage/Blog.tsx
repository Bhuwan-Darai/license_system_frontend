"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useI18n } from "@/app/context/LanguageContext";

type Blog = {
    id: number;
    title: string;
    excerpt: string;
    category: string;
    date: string;
    image: string;
    slug: string;
};

const BLOGS: Blog[] = [
    {
        id: 1,
        title: "How to Apply for a Driving License in Nepal",
        excerpt:
            "A simple guide to the driving license registration process, documents, and what you need to do before your visit.",
        category: "License",
        date: "Sep 18, 2026",
        image: "/blog/license-registration.jpg",
        slug: "how-to-apply-driving-license-nepal",
    },
    {
        id: 2,
        title: "How to Prepare for the Written Driving License Exam",
        excerpt:
            "Learn what to study, how to practice, and how to prepare yourself for the written examination.",
        category: "Exam Preparation",
        date: "Sep 15, 2026",
        image: "/blog/written-exam.jpg",
        slug: "prepare-driving-license-written-exam",
    },
    {
        id: 3,
        title: "Nepal Driving License Categories Explained",
        excerpt:
            "Understand the different driving license categories and which type of vehicle each category covers.",
        category: "License",
        date: "Sep 12, 2026",
        image: "/blog/license-categories.jpg",
        slug: "driving-license-categories-nepal",
    },
    {
        id: 4,
        title: "Traffic Signs You Should Know Before Your Exam",
        excerpt:
            "A practical guide to the traffic signs that are important for your written license examination.",
        category: "Traffic Rules",
        date: "Sep 10, 2026",
        image: "/blog/traffic-signs.jpg",
        slug: "traffic-signs-driving-license-exam",
    },
    {
        id: 5,
        title: "What Happens After the Written Exam?",
        excerpt:
            "Understand the next steps after completing your written driving license examination.",
        category: "License Process",
        date: "Sep 07, 2026",
        image: "/blog/license-process.jpg",
        slug: "what-happens-after-written-exam",
    },
    {
        id: 6,
        title: "Tips for Preparing for Your Driving Trial",
        excerpt:
            "Things to understand and practice before you go for your driving trial.",
        category: "Trial Preparation",
        date: "Sep 04, 2026",
        image: "/blog/driving-trial.jpg",
        slug: "driving-trial-preparation-tips",
    },
];

const CATEGORIES = [
    "All",
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

                <span className="text-xs text-ly-muted mt-2">
                    {position === "left"
                        ? "Your advertisement"
                        : "Your advertisement"}
                </span>

                <span className="text-[10px] text-ly-muted/60 mt-1">
                    160 × 600
                </span>
            </div>
        </aside>
    );
}

export default function Blog() {
    const { m } = useI18n();

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");

    const filteredBlogs = useMemo(() => {
        const query = search.trim().toLowerCase();

        return BLOGS.filter((blog) => {
            const matchesCategory =
                category === "All" || blog.category === category;

            const matchesSearch =
                !query ||
                blog.title.toLowerCase().includes(query) ||
                blog.excerpt.toLowerCase().includes(query) ||
                blog.category.toLowerCase().includes(query);

            return matchesCategory && matchesSearch;
        });
    }, [search, category]);

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
                        Simple guides, exam preparation tips, traffic rules,
                        and useful information to help you along your license
                        journey.
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

                        {filteredBlogs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">

                                {filteredBlogs.map((blog) => (
                                    <article
                                        key={blog.id}
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
                                        <Link
                                            href={`/blog/${blog.slug}`}
                                            className="block overflow-hidden"
                                        >
                                            <div className="relative aspect-[16/9] overflow-hidden">
                                                <Image
                                                    src={blog.image}
                                                    alt={blog.title}
                                                    fill
                                                    className="
                                                        object-cover
                                                        transition-transform
                                                        duration-500
                                                        group-hover:scale-105
                                                    "
                                                />
                                            </div>
                                        </Link>

                                        {/* Content */}
                                        <div className="p-6">
                                            <div className="flex items-center justify-between gap-4 mb-4">
                                                <span className="text-xs uppercase tracking-[0.14em] text-ly-gold">
                                                    {blog.category}
                                                </span>

                                                <span className="text-xs text-ly-muted">
                                                    {blog.date}
                                                </span>
                                            </div>

                                            <Link
                                                href={`/blog/${blog.slug}`}
                                            >
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
                                                    {blog.title}
                                                </h3>
                                            </Link>

                                            <p className="mt-3 text-sm text-ly-muted leading-relaxed">
                                                {blog.excerpt}
                                            </p>

                                            <Link
                                                href={`/blog/${blog.slug}`}
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
                                ))}

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

                    </main>

                    {/* Right advertisement */}
                    <AdRail position="right" />

                </div>
            </div>
        </section>
    );
}