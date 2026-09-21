"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useI18n } from "@/app/context/LanguageContext";

export default function Hero() {
    const router = useRouter();
    const { m, lang } = useI18n();

    const handleChange = () => {
        router.push("/login");
    };

    return (
        <section className="min-h-[calc(100svh-80px)] flex items-center overflow-hidden">
            <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 xl:gap-24 items-center">

                    {/* =========================
                        Text Column
                    ========================== */}
                    <motion.div
                        className="flex flex-col items-start"
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                            duration: 0.8,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >

                        {/* Heading */}
                        <motion.h1
                            className="
                                font-serif
                                text-[clamp(2.25rem,5vw,4.5rem)]
                                leading-[1.05]
                                tracking-tight
                                text-ly-ink
                                font-medium
                            "
                            initial={{ opacity: 0, y: 25 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.8,
                                delay: 0.1,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        >
                            {m.hero.title}
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            className="
                                mt-5 sm:mt-6
                                text-ly-muted
                                text-base sm:text-lg
                                leading-relaxed
                                max-w-xl
                            "
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.7,
                                delay: 0.25,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        >
                            {m.hero.description}
                        </motion.p>

                        {/* =========================
                            Yatra dotted route
                        ========================== */}
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
                            {/* Start point */}
                            <motion.span
                                className="
                                    h-2
                                    w-2
                                    rounded-full
                                    bg-ly-gold
                                    shrink-0
                                "
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    duration: 0.35,
                                    delay: 0.7,
                                    type: "spring",
                                    stiffness: 300,
                                }}
                            />

                            {/* Route */}
                            <motion.span
                                className="
                                    flex-1
                                    border-t
                                    border-dotted
                                    border-ly-gold/50
                                    origin-left
                                "
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{
                                    duration: 0.9,
                                    delay: 0.8,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                            />

                            {/* Destination */}
                            <motion.span
                                className="
                                    h-2
                                    w-2
                                    rounded-full
                                    bg-ly-brand
                                    shrink-0
                                "
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    duration: 0.35,
                                    delay: 1.65,
                                    type: "spring",
                                    stiffness: 300,
                                }}
                            />
                        </div>

                        {/* Second-language tagline */}
                        <motion.p
                            lang={lang === "en" ? "ne" : "en"}
                            className={`
                                ${lang === "en" ? "font-devanagari" : ""}
                                text-base sm:text-lg
                                leading-relaxed
                                text-ly-ink
                                max-w-xl
                            `}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.6,
                                delay: 1.75,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        >
                            {m.hero.tagline}
                        </motion.p>

                        {/* CTA */}
                        <motion.button
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
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.6,
                                delay: 2,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            whileHover={{
                                y: -3,
                            }}
                            whileTap={{
                                y: 0,
                                scale: 0.98,
                            }}
                        >
                            {m.hero.cta}
                        </motion.button>
                    </motion.div>

                    {/* =========================
                        Image Column
                    ========================== */}
                    <motion.div
                        className="
                            relative
                            w-full
                            flex
                            justify-center
                            md:justify-end
                        "
                        initial={{
                            opacity: 0,
                            x: 50,
                        }}
                        animate={{
                            opacity: 1,
                            x: 0,
                        }}
                        transition={{
                            duration: 1,
                            delay: 0.3,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >

                        {/* Decorative background */}
                        <motion.div
                            className="
                                absolute
                                -inset-4
                                sm:-inset-6
                                bg-ly-bg
                                rounded-[2rem]
                                -z-10
                            "
                            initial={{
                                opacity: 0,
                                rotate: 8,
                                scale: 0.9,
                            }}
                            animate={{
                                opacity: 1,
                                rotate: 2,
                                scale: 1,
                            }}
                            transition={{
                                duration: 1,
                                delay: 0.5,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        />

                        {/* License card */}
                        <motion.div
                            animate={{
                                y: [0, -8, 0],
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        >
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
                        </motion.div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}