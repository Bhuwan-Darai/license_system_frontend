"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useI18n } from "@/app/context/LanguageContext";

export default function AboutUs() {
    const { m } = useI18n();
    const { about } = m;

    return (
        <section className="w-full bg-ly-surface">
            <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-24 lg:py-28">

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

                    {/* Left */}
                    <div>
                        <p className="text-sm font-semibold tracking-[0.18em] uppercase text-ly-brand-text mb-4">
                            {about.eyebrow}
                        </p>

                        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.08] font-medium text-ly-ink">
                            {about.titleLine1}
                            <span className="block">
                                {about.titleLine2}
                            </span>
                        </h2>

                        <p className="mt-6 text-ly-muted text-base sm:text-lg leading-relaxed max-w-xl">
                            {about.p1}
                        </p>

                        <p className="mt-4 text-ly-muted text-base sm:text-lg leading-relaxed max-w-xl">
                            {about.p2}
                        </p>

                        <p className="mt-4 text-ly-muted text-base sm:text-lg leading-relaxed max-w-xl">
                            {about.p3}
                        </p>

                        <Link
                            href="/about"
                            className="
                                inline-flex
                                items-center
                                gap-2
                                mt-7
                                text-ly-brand-text
                                font-semibold
                                border-b
                                border-ly-brand-text/40
                                hover:border-ly-brand-text
                                transition-colors
                            "
                        >
                            {about.learnMore}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Right */}
                    <div className="relative">

                        {/* Decorative background */}
                        <div className="absolute -inset-4 bg-ly-bg rounded-[2rem] rotate-2" />

                        <div className="relative bg-ly-panel rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 lg:p-10">

                            <p className="text-xs uppercase tracking-[0.18em] text-ly-gold-soft">
                                {about.helpTitle}
                            </p>

                            <div className="mt-7 space-y-5">
                                {about.points.map((point) => (
                                    <div
                                        key={point}
                                        className="flex items-start gap-4"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-ly-brand flex items-center justify-center shrink-0 mt-0.5">
                                            <Check className="w-3.5 h-3.5 text-white" />
                                        </div>

                                        <p className="text-white/85 text-sm sm:text-base leading-relaxed">
                                            {point}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10">
                                <p className="font-serif text-xl sm:text-2xl text-white">
                                    {about.ctaTitle}
                                </p>

                                <p className="text-sm text-white/50 mt-2">
                                    {about.ctaText}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}