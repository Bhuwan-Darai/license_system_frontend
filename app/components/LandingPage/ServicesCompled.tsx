"use client";

import { useI18n } from "@/app/context/LanguageContext";

export default function ServicesCompleted() {
    const { m, n } = useI18n();
    const { stats } = m;

    return (
        <section className="w-full bg-ly-panel py-16 sm:py-20 lg:py-24">
            <div className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12">

                {/* Hero number */}
                <div className="max-w-2xl">
                    <p className="text-ly-panel-ink/60 leading-relaxed">
                        {stats.intro}
                    </p>

                    <p className="font-serif text-white text-6xl sm:text-7xl lg:text-8xl mt-4 leading-none">
                        {n(stats.count)}
                    </p>

                    <p className="text-ly-panel-ink/80 mt-3">
                        {stats.countLabel}
                    </p>
                </div>

                {/* Supporting stats */}
                <div className="mt-14 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 border-t border-white/10">
                    {stats.items.map((stat, index) => (
                        <div
                            key={stat.label}
                            className={`
                                py-6 sm:py-8
                                sm:px-8
                                ${index > 0 ? "sm:border-l border-white/10" : ""}
                                border-b sm:border-b-0 border-white/10
                                ${index === 0 ? "sm:pl-0" : ""}
                            `}
                        >
                            <p className="font-serif text-white text-3xl sm:text-4xl">
                                {n(stat.value)}
                                {stat.unit && (
                                    <span className="text-ly-panel-ink/50 text-xl sm:text-2xl ml-1">
                                        {stat.unit}
                                    </span>
                                )}
                            </p>
                            <p className="text-ly-panel-ink/60 text-sm mt-2">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}