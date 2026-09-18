// "use client"
// export default function Services(){
//     return (
//             <div className=" mx-auto max-w-6xl px-6 md:px-8 py-24 md:py-32">
//                 <p className="font-serif text-3xl md:text-4xl text-[#131B2E] font-medium max-w-lg">
//                     Two stops. One less trip to the licensing office.
//                 </p>
//
//                 <div className="mt-16 md:mt-20 relative">
//                     {/* Trail connecting the two waypoints */}
//                     <div
//                         className="hidden md:block absolute top-6 left-[8%] right-[8%] border-t border-dotted border-[#8A6D3B]/50 -z-10"
//                         aria-hidden="true"
//                     />
//
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-12">
//                         {/* Waypoint 1 — Registration & guidance */}
//                         <div>
//                             <div className="flex items-center gap-3 mb-6">
//                                 <span className="h-3 w-3 rounded-full bg-[#7A1F2B] shrink-0" />
//                                 <span className="h-px flex-1 bg-[#8A6D3B]/30 md:hidden" />
//                             </div>
//
//                             <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mb-5">
//                                 <path d="M8 4h12l6 6v18a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z"
//                                       stroke="#131B2E" strokeWidth="1.5" strokeLinejoin="round" />
//                                 <path d="M20 4v6h6" stroke="#131B2E" strokeWidth="1.5" strokeLinejoin="round" />
//                                 <path d="M11 18l3.5 3.5L21 15" stroke="#7A1F2B" strokeWidth="1.5"
//                                       strokeLinecap="round" strokeLinejoin="round" />
//                             </svg>
//
//                             <p className="font-serif text-2xl text-[#131B2E] mb-3">
//                                 Registration, handled with you
//                             </p>
//                             <p className="text-[#5C6B7A] leading-relaxed max-w-sm">
//                                 We walk you through every form the licensing office asks for, in
//                                 plain language, so nothing gets rejected for a missed signature or
//                                 a wrong document. You'll always know what's been submitted and
//                                 what's still needed — no separate trips just to ask.
//                             </p>
//                         </div>
//
//                         {/* Waypoint 2 — Exam prep via app */}
//                         <div>
//                             <div className="flex items-center gap-3 mb-6">
//                                 <span className="h-3 w-3 rounded-full bg-[#7A1F2B] shrink-0" />
//                                 <span className="h-px flex-1 bg-[#8A6D3B]/30 md:hidden" />
//                             </div>
//
//                             <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mb-5">
//                                 <rect x="9" y="3" width="14" height="26" rx="2.5"
//                                       stroke="#131B2E" strokeWidth="1.5" />
//                                 <path d="M14 26h4" stroke="#131B2E" strokeWidth="1.5" strokeLinecap="round" />
//                                 <path d="M13 10h6M13 14h6M13 18h3" stroke="#7A1F2B" strokeWidth="1.5"
//                                       strokeLinecap="round" />
//                             </svg>
//
//                             <p className="font-serif text-2xl text-[#131B2E] mb-3">
//                                 Practice on your own time
//                             </p>
//                             <p className="text-[#5C6B7A] leading-relaxed max-w-sm">
//                                 The written exam's real question bank, in our mobile app — practice
//                                 on your commute, track which topics you keep missing, and walk in
//                                 on exam day having already seen the questions in some form.
//                             </p>
//
//                             <a
//                             href="#"
//                             className="mt-5 inline-flex items-center gap-2 text-sm text-[#131B2E] border-b border-[#131B2E] pb-0.5 hover:text-[#7A1F2B] hover:border-[#7A1F2B] transition-colors"
//                             >
//                             Get the app
//                             </a>
//                     </div>
//                 </div>
//                 </div>
//             </div>
//
//     )
// }

"use client "
import { FileText, GraduationCap, Car, ClipboardList, Eye, RefreshCw, ArrowRight } from "lucide-react";

const services = [
    {
        icon: FileText,
        color: "blue",
        title: "License Registration Assistance",
        description:
            "We help you complete the online driving-license registration process correctly and avoid common mistakes.",
        features: ["Application guidance", "Form filling support", "Step-by-step process help"],
        cta: "Get Registration Assistance",
    },
    {
        icon: GraduationCap,
        color: "emerald",
        title: "Free License Practice",
        description:
            "Prepare for your exam with our free mobile & web app. Practice anytime, anywhere.",
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
        icon: Car,
        color: "purple",
        title: "Trial Preparation",
        description: "Be ready for your practical trial with the right knowledge and guidance.",
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
        icon: ClipboardList,
        color: "orange",
        title: "Document & Process Guidance",
        description:
            "Get a clear checklist of what you need at each stage of the process. Avoid delays and avoid missing important documents.",
        features: ["Document checklist", "Photo & ID requirements", "Step-by-step process"],
        cta: "View Requirements",
    },
    {
        icon: Eye,
        color: "teal",
        title: "Eye & Medical Test Guidance",
        description:
            "Understand the examination requirements and prepare for your medical and eye test confidently.",
        features: ["Test process explanation", "What to bring", "Where to go", "Tips for a smooth experience"],
        cta: "Learn More",
    },
    {
        icon: RefreshCw,
        color: "rose",
        title: "License Renewal Assistance",
        description:
            "For existing license holders, we help you with the renewal process and requirements.",
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

const colorClasses = {
    blue: {
        iconBg: "bg-blue-500",
        check: "text-blue-500",
        button: "bg-red-800",
        border: "border-gray-100",
        ring: "",
    },
    emerald: {
        iconBg: "bg-emerald-500",
        check: "text-emerald-500",
        button: "bg-red-800",
        border: "border-gray-100",
        ring: "ring-1 ring-emerald-100",
    },
    purple: {
        iconBg: "bg-purple-500",
        check: "text-purple-500",
        button: "bg-red-800",
        border: "border-gray-100",
        ring: "",
    },
    orange: {
        iconBg: "bg-orange-500",
        check: "text-orange-500",
        button: "bg-red-800",
        border: "border-gray-100",
        ring: "",
    },
    teal: {
        iconBg: "bg-teal-500",
        check: "text-teal-500",
        button: "bg-red-800",
        border: "border-gray-100",
        ring: "",
    },
    rose: {
        iconBg: "bg-rose-500",
        check: "text-rose-500",
        button: "bg-red-800",
        border: "border-gray-100",
        ring: "",
    },
};

export default function ServicesGrid() {
    return (
        <section className="max-w-7xl mx-auto px-6 py-16 flex flex-col items-center">
            <span className="text-5xl mb-16 mt-6"> Our Services</span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => {
                    const Icon = service.icon;
                    const c = colorClasses[service.color];
                    return (
                        <div
                            key={service.title}
                            className={`relative bg-white rounded-2xl border ${c.border} ${c.ring} shadow-sm p-6 flex flex-col`}
                        >


                            <h3 className="text-lg font-bold text-slate-900 mb-2 pr-16">{service.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed mb-4">{service.description}</p>

                            <ul className="space-y-2 mb-6">
                                {service.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                                        <svg
                                            className={`h-4 w-4 shrink-0 ${c.check}`}
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.7 5.3a1 1 0 010 1.4l-7.4 7.4a1 1 0 01-1.4 0L3.3 9.5a1 1 0 111.4-1.4l3.9 3.9 6.7-6.7a1 1 0 011.4 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`mt-auto inline-flex items-center justify-center gap-2 ${c.button} text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors`}
                            >
                                {service.cta}
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}