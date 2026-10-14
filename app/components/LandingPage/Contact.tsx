import { Mail, MapPin, Phone } from "lucide-react";
import { getI18n } from "@/app/i18n/server";
import ContactForm from "./ContactForm";

export default async function ContactUs() {
    const { m } = await getI18n();
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

                    <ContactForm />
                </div>
            </div>
        </section>
    );
}