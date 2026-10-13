"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/app/context/LanguageContext";
import { sendInquiry, validateInquiry, type InquiryValues } from "@/app/utils/inquiry";

// The only interactive part of the contact page. The rest of the page is
// rendered on the server (see Contact.tsx).
export default function ContactForm() {
    const { m } = useI18n();
    const { contact } = m;

    const empty: InquiryValues = { name: "", phone: "", email: "", help_type: "", message: "" };
    const [values, setValues] = useState<InquiryValues>(empty);
    // honeypot: hidden from people, bots tend to fill it
    const [website, setWebsite] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
    const [serverMessage, setServerMessage] = useState("");

    const onChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
        if (status !== "sending") setStatus("idle");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (status === "sending") return;

        // same rules as the server; the server is still the one that enforces them
        const problems = validateInquiry(values).map((key) => contact.errors[key]);
        setErrors(problems);
        if (problems.length > 0) return;

        setStatus("sending");
        const result = await sendInquiry(values, website);
        if (result.ok) {
            setValues(empty);
            setStatus("success");
        } else {
            setServerMessage(result.tooMany ? contact.tooMany : contact.error);
            setStatus("error");
        }
    };

    return (
            <div className="bg-ly-card border border-ly-ink/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10">

                <h3 className="font-serif text-2xl sm:text-3xl text-ly-ink">
                    {contact.formTitle}
                </h3>

                <p className="text-sm text-ly-muted mt-2">
                    {contact.formSubtitle}
                </p>

                <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">

                    {/* Honeypot: invisible to people, ignored by screen readers */}
                    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                        <label htmlFor="website">Website</label>
                        <input
                            id="website"
                            name="website"
                            type="text"
                            tabIndex={-1}
                            autoComplete="off"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                        />
                    </div>


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
                                id="name" name="name" value={values.name} onChange={onChange} maxLength={100} autoComplete="name"
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
                                id="phone" name="phone" value={values.phone} onChange={onChange} maxLength={20} autoComplete="tel"
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
                            id="email" name="email" value={values.email} onChange={onChange} maxLength={254} autoComplete="email"
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
                            id="help" name="help_type" value={values.help_type} onChange={onChange}
                            
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
                            id="message" name="message" value={values.message} onChange={onChange} maxLength={2000}
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

                    {/* Validation + result messages */}
                    {errors.length > 0 && (
                        <ul role="alert" className="text-sm text-red-600 list-disc pl-5 space-y-1">
                            {errors.map((err) => (
                                <li key={err}>{err}</li>
                            ))}
                        </ul>
                    )}
                    {status === "success" && (
                        <p role="status" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                            {contact.success}
                        </p>
                    )}
                    {status === "error" && (
                        <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                            {serverMessage}
                        </p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={status === "sending"}
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
                        {status === "sending" ? contact.sending : contact.send}
                        <ArrowRight className="w-4 h-4" />
                    </button>

                </form>
            </div>
    );
}
