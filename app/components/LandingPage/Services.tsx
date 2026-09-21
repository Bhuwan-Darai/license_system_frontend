"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import { useI18n } from "@/app/context/LanguageContext";

// Index of the highlighted step (Free License Practice)
const FEATURED_INDEX = 1;

export default function ServicesGrid() {
    const { m, n } = useI18n();
    const { services } = m;

    return (
        <section className="w-full bg-ly-surface">
            <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 py-10 md:py-28">

                {/* Header */}
                <motion.div
                    className="mb-16 md:mb-20"
                    initial={{
                        opacity: 0,
                        y: 35,
                    }}
                    whileInView={{
                        opacity: 1,
                        y: 0,
                    }}
                    viewport={{
                        amount: 0.25,
                    }}
                    transition={{
                        duration: 0.7,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                >
                    <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-ly-ink">
                        {services.title}
                    </h2>
                </motion.div>

                {/* Journey */}
                <div className="relative">

                    {/* Vertical trail */}
                    <motion.div
                        className="
                            absolute
                            left-[20px]
                            md:left-1/2
                            top-0
                            bottom-0
                            w-px
                            bg-ly-gold/30
                            origin-top
                        "
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true, amount: 0.1 }}
                        transition={{
                            duration: 1.8,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    />

                    <div className="space-y-20 md:space-y-28">

                        {services.items.map((service, index) => {
                            const featured = index === FEATURED_INDEX;
                            const number = n(String(index + 1).padStart(2, "0"));
                            const isEven = index % 2 === 0;

                            return (
                                <motion.div
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
                                        !isEven
                                            ? "md:[&>*:first-child]:order-2"
                                            : ""
                                    }
                                    `}
                                    initial={{
                                        opacity: 0,
                                        y: 35,
                                    }}
                                    whileInView={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    viewport={{
                                        once: true,
                                        amount: 0.25,
                                    }}
                                    transition={{
                                        duration: 0.7,
                                        delay: index * 0.08,
                                        ease: [0.22, 1, 0.36, 1],
                                    }}
                                >

                                    {/* Number / waypoint */}
                                    <motion.div
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
                                        initial={{
                                            scale: 0.5,
                                            opacity: 0,
                                        }}
                                        whileInView={{
                                            scale: 1,
                                            opacity: 1,
                                        }}
                                        viewport={{
                                            once: true,
                                            amount: 0.5,
                                        }}
                                        transition={{
                                            duration: 0.45,
                                            delay: index * 0.08 + 0.15,
                                            type: "spring",
                                            stiffness: 260,
                                            damping: 18,
                                        }}
                                    >
                                        {number}
                                    </motion.div>

                                    {/* Content */}
                                    <div
                                        className={`
                                            col-start-2
                                            md:col-start-auto
                                            ${
                                            isEven
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
                                                isEven
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
                                        <motion.div
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
                                            initial={{
                                                opacity: 0,
                                                x: 35,
                                                scale: 0.96,
                                            }}
                                            whileInView={{
                                                opacity: 1,
                                                x: 0,
                                                scale: 1,
                                            }}
                                            viewport={{
                                                once: true,
                                                amount: 0.3,
                                            }}
                                            transition={{
                                                duration: 0.8,
                                                delay: 0.25,
                                                ease: [0.22, 1, 0.36, 1],
                                            }}
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
                                                        <motion.div
                                                            key={item}
                                                            className="flex items-center gap-3"
                                                            initial={{
                                                                opacity: 0,
                                                                x: 10,
                                                            }}
                                                            whileInView={{
                                                                opacity: 1,
                                                                x: 0,
                                                            }}
                                                            viewport={{
                                                                once: true,
                                                            }}
                                                            transition={{
                                                                duration: 0.4,
                                                                delay: 0.4,
                                                            }}
                                                        >
                                                            <Check className="w-4 h-4 text-ly-brand-text" />

                                                            <span className="text-sm text-ly-muted">
                                                                {item}
                                                            </span>
                                                        </motion.div>
                                                    ))}
                                                </div>

                                            </div>
                                        </motion.div>
                                    )}

                                </motion.div>
                            );
                        })}

                    </div>
                </div>
            </div>
        </section>
    );
}