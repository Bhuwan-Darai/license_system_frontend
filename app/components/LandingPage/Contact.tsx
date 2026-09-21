"use client";

import { Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { useI18n } from "@/app/context/LanguageContext";

export default function ContactUs() {
    const { m } = useI18n();
    const { contact } = m;

    return (
        <section className="w-full bg-ly-surface">
            <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 py-20 sm:py-24 lg:py-28">

                {/* Heading */}
                <div className="max-w-2xl mb-12 sm:mb-16">
                    <p className="text-sm font-semibold tracking-[0.18em] uppercase text-ly-brand-text mb-4">
                        {contact.eyebrow}
                    </p>

                    <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.08] font-medium text-ly-ink">
                        {contact.title}
                    </h2>

                    <p className="mt-5 text-ly-muted text-base sm:text-lg leading-relaxed max-w-xl">
                        {contact.intro}
                    </p>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-8 lg:gap-12">

                    {/* Contact Information */}
                    <div className="bg-ly-panel rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-white">

                        <p className="text-xs uppercase tracking-[0.18em] text-ly-gold-soft">
                            {contact.infoEyebrow}
                        </p>

                        <h3 className="font-serif text-2xl sm:text-3xl mt-3">
                            {contact.infoTitle}
                        </h3>

                        <p className="text-white/55 text-sm sm:text-base leading-relaxed mt-4 max-w-sm">
                            {contact.infoText}
                        </p>

                        <div className="mt-8 space-y-5">

                            {/* Phone */}
                            <a
                                href="tel:+9779800000000"
                                className="flex items-center gap-4 group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-ly-brand transition-colors">
                                    <Phone className="w-4 h-4" />
                                </div>

                                <div>
                                    <p className="text-xs text-white/40 uppercase tracking-wider">
                                        {contact.phone}
                                    </p>
                                    <p className="text-sm mt-1 text-white/85">
                                        +977 9800000000
                                    </p>
                                </div>
                            </a>

                            {/* Email */}
                            <a
                                href="mailto:hello@likhityatra.com"
                                className="flex items-center gap-4 group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-ly-brand transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>

                                <div>
                                    <p className="text-xs text-white/40 uppercase tracking-wider">
                                        {contact.email}
                                    </p>
                                    <p className="text-sm mt-1 text-white/85 break-all">
                                        hello@likhityatra.com
                                    </p>
                                </div>
                            </a>

                            {/* Location */}
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                                    <MapPin className="w-4 h-4" />
                                </div>

                                <div>
                                    <p className="text-xs text-white/40 uppercase tracking-wider">
                                        {contact.location}
                                    </p>
                                    <p className="text-sm mt-1 text-white/85">
                                        {contact.locationValue}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10">
                            <p className="text-sm text-white/45 leading-relaxed">
                                {contact.instituteNote}
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-ly-card border border-ly-ink/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10">

                        <h3 className="font-serif text-2xl sm:text-3xl text-ly-ink">
                            {contact.formTitle}
                        </h3>

                        <p className="text-sm text-ly-muted mt-2">
                            {contact.formSubtitle}
                        </p>

                        <form className="mt-7 space-y-5">

                            {/* Name + Phone */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-ly-ink mb-2"
                                    >
                                        {contact.name}
                                    </label>

                                    <input
                                        id="name"
                                        type="text"
                                        placeholder={contact.namePlaceholder}
                                        className="
                                            w-full
                                            bg-ly-surface
                                            border
                                            border-ly-ink/10
                                            rounded-xl
                                            px-4
                                            py-3
                                            text-sm
                                            text-ly-ink
                                            placeholder:text-ly-muted/60
                                            focus:outline-none
                                            focus:border-ly-brand-text
                                            transition-colors
                                        "
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="phone"
                                        className="block text-sm font-medium text-ly-ink mb-2"
                                    >
                                        {contact.phoneLabel}
                                    </label>

                                    <input
                                        id="phone"
                                        type="tel"
                                        placeholder="98XXXXXXXX"
                                        className="
                                            w-full
                                            bg-ly-surface
                                            border
                                            border-ly-ink/10
                                            rounded-xl
                                            px-4
                                            py-3
                                            text-sm
                                            text-ly-ink
                                            placeholder:text-ly-muted/60
                                            focus:outline-none
                                            focus:border-ly-brand-text
                                            transition-colors
                                        "
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-ly-ink mb-2"
                                >
                                    {contact.email}
                                    <span className="text-ly-muted font-normal">
                                        {" "}{contact.optional}
                                    </span>
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className="
                                        w-full
                                        bg-ly-surface
                                        border
                                        border-ly-ink/10
                                        rounded-xl
                                        px-4
                                        py-3
                                        text-sm
                                        text-ly-ink
                                        placeholder:text-ly-muted/60
                                        focus:outline-none
                                        focus:border-ly-brand-text
                                        transition-colors
                                    "
                                />
                            </div>

                            {/* Help Type */}
                            <div>
                                <label
                                    htmlFor="help"
                                    className="block text-sm font-medium text-ly-ink mb-2"
                                >
                                    {contact.helpLabel}
                                </label>

                                <select
                                    id="help"
                                    defaultValue=""
                                    className="
                                        w-full
                                        bg-ly-surface
                                        border
                                        border-ly-ink/10
                                        rounded-xl
                                        px-4
                                        py-3
                                        text-sm
                                        text-ly-ink
                                        focus:outline-none
                                        focus:border-ly-brand-text
                                        transition-colors
                                    "
                                >
                                    <option value="" disabled>
                                        {contact.helpPlaceholder}
                                    </option>
                                    <option value="registration">
                                        {contact.helpOptions.registration}
                                    </option>
                                    <option value="practice">
                                        {contact.helpOptions.practice}
                                    </option>
                                    <option value="trial">
                                        {contact.helpOptions.trial}
                                    </option>
                                    <option value="institute">
                                        {contact.helpOptions.institute}
                                    </option>
                                    <option value="other">
                                        {contact.helpOptions.other}
                                    </option>
                                </select>
                            </div>

                            {/* Message */}
                            <div>
                                <label
                                    htmlFor="message"
                                    className="block text-sm font-medium text-ly-ink mb-2"
                                >
                                    {contact.message}
                                </label>

                                <textarea
                                    id="message"
                                    rows={5}
                                    placeholder={contact.messagePlaceholder}
                                    className="
                                        w-full
                                        resize-none
                                        bg-ly-surface
                                        border
                                        border-ly-ink/10
                                        rounded-xl
                                        px-4
                                        py-3
                                        text-sm
                                        text-ly-ink
                                        placeholder:text-ly-muted/60
                                        focus:outline-none
                                        focus:border-ly-brand-text
                                        transition-colors
                                    "
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="
                                    w-full
                                    sm:w-auto
                                    inline-flex
                                    items-center
                                    justify-center
                                    gap-2
                                    bg-ly-brand
                                    hover:bg-ly-brand-hover
                                    text-white
                                    px-6
                                    py-3.5
                                    rounded-xl
                                    font-medium
                                    transition-all
                                    duration-200
                                    hover:-translate-y-0.5
                                    hover:shadow-lg
                                "
                            >
                                {contact.send}
                                <ArrowRight className="w-4 h-4" />
                            </button>

                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}