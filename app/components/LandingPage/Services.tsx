"use client";

import {
    FileText,
    GraduationCap,
    Car,
    ClipboardList,
    Eye,
    RefreshCw,
    ArrowRight,
    Check,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

type ServiceColor =
    | "blue"
    | "emerald"
    | "purple"
    | "orange"
    | "teal"
    | "rose";

type Service = {
    id: number;
    icon: LucideIcon;
    color: ServiceColor;
    title: string;
    description: string;
    features: string[];
    cta: string;
    badge?: string;
};

const services: Service[] = [
    {
        id: 1,
        icon: FileText,
        color: "blue",
        title: "License Registration Assistance",
        description:
            "We help you complete the online driving-license registration process correctly and avoid common mistakes.",
        features: [
            "Application guidance",
            "Form filling support",
            "Step-by-step process help",
        ],
        cta: "Get Registration Assistance",
    },
    {
        id: 2,
        icon: GraduationCap,
        color: "emerald",
        title: "Free License Practice",
        description:
            "Prepare for your exam with our free mobile and web app. Practice anytime, anywhere.",
        features: [
            "License MCQs",
            "Traffic signs",
            "Traffic rules",
            "Mock examinations",
            "Detailed results & progress",
            "Unlimited practice",
        ],
        cta: "Start Practicing Free",
        badge: "Most Popular",
    },
    {
        id: 3,
        icon: Car,
        color: "purple",
        title: "Trial Preparation",
        description:
            "Be ready for your practical trial with the right knowledge and guidance.",
        features: [
            "Trial procedure guide",
            "Vehicle-specific preparation",
            "Common mistakes",
            "Trial checklist",
            "Road markings & practical tips",
            "Required documents",
        ],
        cta: "View Trial Guide",
    },
    {
        id: 4,
        icon: ClipboardList,
        color: "orange",
        title: "Document & Process Guidance",
        description:
            "Get a clear checklist of what you need at each stage of the process and avoid unnecessary delays.",
        features: [
            "Document checklist",
            "Photo & ID requirements",
            "Step-by-step process",
        ],
        cta: "View Requirements",
    },
    {
        id: 5,
        icon: Eye,
        color: "teal",
        title: "Eye & Medical Test Guidance",
        description:
            "Understand the examination requirements and prepare for your medical and eye test confidently.",
        features: [
            "Test process explanation",
            "What to bring",
            "Where to go",
            "Tips for a smooth experience",
        ],
        cta: "Learn More",
    },
    {
        id: 6,
        icon: RefreshCw,
        color: "rose",
        title: "License Renewal Assistance",
        description:
            "For existing license holders, we help you understand the renewal process and requirements.",
        features: [
            "Renewal process guidance",
            "Required documents",
            "Fee information",
            "Appointment guidance",
            "Process checklist",
        ],
        cta: "Renewal Assistance",
    },
];

const colorClasses: Record<
    ServiceColor,
    {
        iconBg: string;
        iconColor: string;
        check: string;
        button: string;
        buttonHover: string;
        border: string;
        ring: string;
    }
> = {
    blue: {
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        check: "text-blue-500",
        button: "bg-[#7A1F2B]",
        buttonHover: "hover:bg-[#641923]",
        border: "border-gray-100",
        ring: "",
    },

    emerald: {
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        check: "text-emerald-500",
        button: "bg-emerald-600",
        buttonHover: "hover:bg-emerald-700",
        border: "border-emerald-200",
        ring: "ring-1 ring-emerald-100",
    },

    purple: {
        iconBg: "bg-purple-50",
        iconColor: "text-purple-600",
        check: "text-purple-500",
        button: "bg-[#7A1F2B]",
        buttonHover: "hover:bg-[#641923]",
        border: "border-gray-100",
        ring: "",
    },

    orange: {
        iconBg: "bg-orange-50",
        iconColor: "text-orange-600",
        check: "text-orange-500",
        button: "bg-[#7A1F2B]",
        buttonHover: "hover:bg-[#641923]",
        border: "border-gray-100",
        ring: "",
    },

    teal: {
        iconBg: "bg-teal-50",
        iconColor: "text-teal-600",
        check: "text-teal-500",
        button: "bg-[#7A1F2B]",
        buttonHover: "hover:bg-[#641923]",
        border: "border-gray-100",
        ring: "",
    },

    rose: {
        iconBg: "bg-rose-50",
        iconColor: "text-rose-600",
        check: "text-rose-500",
        button: "bg-[#7A1F2B]",
        buttonHover: "hover:bg-[#641923]",
        border: "border-gray-100",
        ring: "",
    },
};

export default function ServicesGrid() {
    return (
        <section className="w-full bg-[#F8FAFC]">
            <div className="max-w-7xl mx-auto px-6 md:px-8 py-20 md:py-28">

                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-14">
                    <p className="text-sm font-semibold tracking-[0.18em] uppercase text-[#7A1F2B] mb-3">
                        Our Services
                    </p>

                    <h2 className="font-serif text-4xl md:text-5xl font-medium text-[#131B2E]">
                        Your Driving License Journey,
                        <span className="block text-[#7A1F2B]">
                            Made Easier
                        </span>
                    </h2>

                    <p className="mt-5 text-[#5C6B7A] leading-relaxed">
                        From registration to exam preparation, we provide
                        practical guidance to help you move through the
                        driving-license process with confidence.
                    </p>
                </div>

                {/* Services */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => {
                        const c = colorClasses[service.color];
                        const Icon = service.icon;

                        return (
                            <article
                                key={service.id}
                                className={`
                                    relative
                                    bg-white
                                    rounded-2xl
                                    border
                                    ${c.border}
                                    ${c.ring}
                                    shadow-sm
                                    p-6
                                    flex
                                    flex-col
                                    min-h-[430px]
                                    transition-all
                                    duration-300
                                    hover:-translate-y-1
                                    hover:shadow-lg
                                `}
                            >
                                {/* Badge */}
                                {service.badge && (
                                    <span className="absolute top-5 right-5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                                        {service.badge}
                                    </span>
                                )}

                                {/* Icon */}
                                <div
                                    className={`
                                        w-12
                                        h-12
                                        rounded-full
                                        ${c.iconBg}
                                        flex
                                        items-center
                                        justify-center
                                        mb-6
                                    `}
                                >
                                    <Icon
                                        className={`w-6 h-6 ${c.iconColor}`}
                                        strokeWidth={1.8}
                                    />
                                </div>

                                {/* Title */}
                                <h3
                                    className={`
                                        text-xl
                                        font-semibold
                                        text-[#131B2E]
                                        mb-3
                                        ${service.badge ? "pr-20" : ""}
                                    `}
                                >
                                    {service.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-[#5C6B7A] leading-relaxed mb-6">
                                    {service.description}
                                </p>

                                {/* Features */}
                                <ul className="space-y-3 mb-8">
                                    {service.features.map((feature) => (
                                        <li
                                            key={feature}
                                            className="flex items-start gap-2.5 text-sm text-slate-600"
                                        >
                                            <Check
                                                className={`
                                                    w-4
                                                    h-4
                                                    mt-0.5
                                                    shrink-0
                                                    ${c.check}
                                                `}
                                                strokeWidth={2.5}
                                            />

                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <button
                                    type="button"
                                    className={`
                                        mt-auto
                                        w-full
                                        inline-flex
                                        items-center
                                        justify-center
                                        gap-2
                                        ${c.button}
                                        ${c.buttonHover}
                                        text-white
                                        text-sm
                                        font-semibold
                                        px-5
                                        py-3
                                        rounded-lg
                                        transition-all
                                        duration-200
                                    `}
                                >
                                    {service.cta}

                                    <ArrowRight
                                        className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                                    />
                                </button>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}