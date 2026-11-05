import Image from "next/image";
import Link from "next/link";
import { getI18n } from "@/app/i18n/server";

export default async function Hero() {
    const { m, lang } = await getI18n();

    return (
        <section className="border-b border-ly-ink/15">
            <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20 lg:py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">

                    <div className="flex flex-col items-start">
                        <h1 className="font-serif text-[clamp(2.25rem,4.6vw,4rem)] leading-[1.1] text-ly-ink font-medium">
                            {m.hero.title}
                        </h1>

                        <p className="mt-6 text-ly-muted text-base sm:text-lg leading-relaxed max-w-xl">
                            {m.hero.description}
                        </p>

                        <p
                            lang={lang === "en" ? "ne" : "en"}
                            className={`${lang === "en" ? "font-devanagari" : ""} mt-5 pl-4 border-l-2 border-ly-gold text-base sm:text-lg leading-relaxed text-ly-ink max-w-xl`}
                        >
                            {m.hero.tagline}
                        </p>

                        <Link
                            href="/contact"
                            className="mt-8 inline-flex items-center justify-center bg-ly-brand hover:bg-ly-brand-hover text-white px-6 py-3 rounded-md text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ly-brand-text"
                        >
                            {m.hero.cta}
                        </Link>
                    </div>

                    <div className="w-full flex justify-center md:justify-end">
                        <Image
                            src="/license-card.png.jpg"
                            priority
                            width={700}
                            height={460}
                            alt={m.hero.imageAlt}
                            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 600px"
                            className="w-full max-w-[640px] h-auto rounded-md border border-ly-ink/15"
                        />
                    </div>

                </div>
            </div>
        </section>
    );
}
