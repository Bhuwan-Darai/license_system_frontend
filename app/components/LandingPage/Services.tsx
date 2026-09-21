"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useI18n } from "@/app/context/LanguageContext";

// Index of the highlighted step (Free License Practice); its content lives in the dictionaries
const FEATURED_INDEX = 1;

export default function ServicesGrid() {
    const { m, n } = useI18n();
    const { services } = m;

    return (
        <section className="w-full bg-ly-surface">
            <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 py-10 md:py-28">

                {/* Header */}
                <div className="mb-16 md:mb-20">
                    <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-ly-ink">
                        {services.title}
                    </h2>
                </div>

                {/* Journey */}
                <div className="relative">

                    {/* Vertical trail */}
                    <div
                        className="
                            absolute
                            left-[20px]
                            md:left-1/2
                            top-0
                            bottom-0
                            w-px
                            bg-ly-gold/30
                        "
                    />

                    <div className="space-y-20 md:space-y-28">

                        {services.items.map((service, index) => {
                            const featured = index === FEATURED_INDEX;
                            const number = n(String(index + 1).padStart(2, "0"));

                            return (
                            <div
                                key={index}
                                className={`
                                    relative
                                    grid
                                    grid-cols-[40px_1fr]
                                    md:grid-cols-2
                                    gap-6
                                    md:gap-16
                                    items-center
                                    ${
                                    index % 2 === 0
                                        ? ""
                                        : "md:[&>*:first-child]:order-2"
                                }
                                `}
                            >

                                {/* Number / waypoint */}
                                <div
                                    className={`
                                        absolute
                                        left-0
                                        md:left-1/2
                                        md:-translate-x-1/2
                                        z-10
                                        w-10
                                        h-10
                                        rounded-full
                                        flex
                                        items-center
                                        justify-center
                                        border
                                        ${
                                        featured
                                            ? "bg-ly-brand border-ly-brand text-white"
                                            : "bg-ly-surface border-ly-gold/50 text-ly-brand-text"
                                    }
                                        text-xs
                                        font-semibold
                                    `}
                                >
                                    {number}
                                </div>

                                {/* Content */}
                                <div
                                    className={`
                                        col-start-2
                                        md:col-start-auto
                                        ${
                                        index % 2 === 0
                                            ? "md:text-right"
                                            : "md:text-left"
                                    }
                                    `}
                                >

                                    <p className="text-sm uppercase tracking-[0.16em] text-ly-gold mb-3">
                                        {service.shortTitle}
                                    </p>

                                    <h3
                                        className="
                                            font-serif
                                            text-2xl
                                            sm:text-3xl
                                            text-ly-ink
                                            mb-4
                                        "
                                    >
                                        {service.title}
                                    </h3>

                                    <p
                                        className={`
                                            text-ly-muted
                                            leading-relaxed
                                            max-w-md
                                            ${
                                            index % 2 === 0
                                                ? "md:ml-auto"
                                                : ""
                                        }
                                        `}
                                    >
                                        {service.description}
                                    </p>

                                    <Link
                                        href="#"
                                        className="
                                            inline-flex
                                            items-center
                                            mt-5
                                            text-sm
                                            font-semibold
                                            text-ly-brand-text
                                            border-b
                                            border-ly-brand-text/40
                                            hover:border-ly-brand-text
                                            transition-colors
                                        "
                                    >
                                        {service.cta}
                                    </Link>
                                </div>

                                {/* Featured practice visual */}
                                {featured && (
                                    <div
                                        className="
                                            hidden
                                            md:flex
                                            items-center
                                            justify-center
                                            bg-ly-bg
                                            rounded-3xl
                                            min-h-[280px]
                                            border
                                            border-ly-gold/20
                                        "
                                    >
                                        <div className="w-[230px]">

                                            <div className="flex justify-between items-center mb-5">
                                                <span className="text-xs uppercase tracking-wider text-ly-gold">
                                                    {services.practice.label}
                                                </span>

                                                <span className="text-xs text-ly-muted">
                                                    {services.practice.free}
                                                </span>
                                            </div>

                                            <div className="text-5xl font-serif text-ly-ink mb-2">
                                                {n(services.practice.count)}
                                            </div>

                                            <p className="text-sm text-ly-muted mb-6">
                                                {services.practice.countLabel}
                                            </p>

                                            <div className="h-px bg-ly-gold/30 mb-5" />

                                            <div className="space-y-3">
                                                {services.practice.items.map((item) => (
                                                    <div key={item} className="flex items-center gap-3">
                                                        <Check className="w-4 h-4 text-ly-brand-text" />
                                                        <span className="text-sm text-ly-muted">
                                                            {item}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                            );
                        })}

                    </div>
                </div>
            </div>
        </section>
    );
}