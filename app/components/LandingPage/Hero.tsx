"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useI18n } from "@/app/context/LanguageContext";

export default function Hero() {
    const router = useRouter();
    const { m, lang } = useI18n();

    const handleChange = () => {
        router.push("/login");
    };

    return (
        <section className="min-h-[calc(100svh-80px)] flex items-center">
            <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 xl:gap-24 items-center">

                    {/* =========================
                        Text Column
                    ========================== */}
                    <div className="flex flex-col items-start">

                        {/* Heading */}
                        <h1
                            className="
                                font-serif
                                text-[clamp(2.25rem,5vw,4.5rem)]
                                leading-[1.05]
                                tracking-tight
                                text-ly-ink
                                font-medium
                            "
                        >
                            {m.hero.title}
                        </h1>

                        {/* Description */}
                        <p
                            className="
                                mt-5 sm:mt-6
                                text-ly-muted
                                text-base sm:text-lg
                                leading-relaxed
                                max-w-xl
                            "
                        >
                            {m.hero.description}
                        </p>

                        {/* Yatra dotted route */}
                        <div
                            className="
                                flex
                                items-center
                                gap-3
                                mt-6
                                mb-5
                                w-full
                                max-w-md
                            "
                            aria-hidden="true"
                        >
                            <span className="h-2 w-2 rounded-full bg-ly-gold shrink-0" />

                            <span className="flex-1 border-t border-dotted border-ly-gold/50" />

                            <span className="h-2 w-2 rounded-full bg-ly-brand shrink-0" />
                        </div>

                        {/* Second-language tagline: Nepali on the English site, English on the Nepali site */}
                        <p
                            lang={lang === "en" ? "ne" : "en"}
                            className={`
                                ${lang === "en" ? "font-devanagari" : ""}
                                text-base sm:text-lg
                                leading-relaxed
                                text-ly-ink
                                max-w-xl
                            `}
                        >
                            {m.hero.tagline}
                        </p>

                        {/* CTA */}
                        <button
                            type="button"
                            onClick={handleChange}
                            className="
                                mt-7 sm:mt-8
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                bg-ly-brand
                                hover:bg-ly-brand-hover
                                text-[#FAF7F0]
                                px-6 sm:px-7
                                py-3 sm:py-3.5
                                rounded-xl sm:rounded-2xl
                                text-base sm:text-lg
                                font-medium
                                transition-all
                                duration-200
                                hover:-translate-y-0.5
                                hover:shadow-lg
                                active:translate-y-0
                            "
                        >
                            {m.hero.cta}
                        </button>
                    </div>

                    {/* =========================
                        Image Column
                    ========================== */}
                    <div className="relative w-full flex justify-center md:justify-end">

                        {/* Decorative background */}
                        <div
                            className="
                                absolute
                                -inset-4
                                sm:-inset-6
                                bg-ly-bg
                                rounded-[2rem]
                                rotate-2
                                -z-10
                            "
                        />

                        <Image
                            src="/license-card.png.jpg"
                            loading="eager"
                            priority
                            width={700}
                            height={460}
                            alt={m.hero.imageAlt}
                            sizes="
                                (max-width: 640px) 92vw,
                                (max-width: 1024px) 45vw,
                                600px
                            "
                            className="
                                w-full
                                max-w-[700px]
                                h-auto
                                rounded-xl
                                shadow-[0_25px_60px_-20px_rgba(19,27,46,0.4)]
                            "
                        />
                    </div>

                </div>
            </div>
        </section>
    );
}