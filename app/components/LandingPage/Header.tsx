"use client";

import Link from "next/link";
import { Button } from "antd";
import { ChevronRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/app/context/LanguageContext";
import ThemeToggle from "@/app/components/ui/ThemeToggle";
import LanguageSwitcher from "@/app/components/ui/LanguageSwitcher";
import {useRouter} from "next/navigation";

const NAV_LINKS = [
    { href: "/home", key: "home" },
    { href: "/about", key: "about" },
    { href: "/pricing", key: "pricing" },
    { href: "/contact", key: "contact" },
    { href: "blog", key: "blog" },
] as const;

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { m } = useI18n();
    const router = useRouter();

    const handleLogin = () => {
        router.push("/contact");
    }

    return (
        <header className="bg-ly-panel w-full">
            {/* Main Header */}
            <div className="px-5 sm:px-8 lg:px-12 py-4 sm:py-5 flex items-center justify-between">

                {/* Logo */}
                <Link href="/home" className="flex items-center shrink-0">
                    <div className="bg-ly-panel-ink rounded-xl sm:rounded-2xl w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center text-[#7A1F2B]">
                        <span className="text-xl sm:text-2xl font-bold">
                            LY
                        </span>
                    </div>

                    <p className="font-serif text-ly-panel-ink ml-2 sm:ml-3 text-lg sm:text-xl tracking-tight">
                        Likhit Yatra
                    </p>
                </Link>

                {/* Desktop Menu */}
                <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-ly-panel-ink/80 text-[15px] tracking-wide">
                    {NAV_LINKS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group relative py-1 hover:text-ly-panel-ink transition-colors"
                        >
                            {m.nav[item.key]}
                            <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-ly-gold transition-all duration-200 group-hover:w-full" />
                        </Link>
                    ))}
                </nav>

                {/* Desktop controls + CTA */}
                <div className="hidden md:flex items-center gap-3">
                    <LanguageSwitcher />
                    <ThemeToggle />
                    <Button
                        style={{
                            minWidth: "150px",
                            height: "42px",
                            borderRadius: "12px",
                            color: "#EEE8DD",
                            fontWeight: 600,
                            fontSize: "1rem",
                            background: "#7A1F2B",
                            border: "none",
                        }}
                        onClick={() => {handleLogin()}}
                    >
                        {m.header.startJourney} <ChevronRight size={18} />
                    </Button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    type="button"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden text-ly-panel-ink p-2.5 -mr-2.5"
                    aria-label={m.common.toggleMenu}
                    aria-expanded={mobileMenuOpen}
                >
                    {mobileMenuOpen ? (
                        <X className="w-7 h-7" />
                    ) : (
                        <Menu className="w-7 h-7" />
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-white/10 px-5 py-5">
                    <nav className="flex flex-col gap-1">
                        {NAV_LINKS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-ly-panel-ink/80 text-[15px] tracking-wide hover:bg-white/5 hover:text-ly-panel-ink px-4 py-3 rounded-lg transition-colors"
                            >
                                {m.nav[item.key]}
                            </Link>
                        ))}

                        <div className="flex items-center gap-3 px-4 pt-4">
                            <LanguageSwitcher />
                            <ThemeToggle />
                        </div>

                        <Button
                            block
                            style={{
                                marginTop: "12px",
                                height: "44px",
                                borderRadius: "10px",
                                color: "#EEE8DD",
                                fontWeight: 600,
                                fontSize: "1rem",
                                background: "#7A1F2B",
                                border: "none",
                            }}
                            onClick={() => {handleLogin}}
                        >
                            {m.header.startJourney}
                        </Button>
                    </nav>
                </div>
            )}
        </header>
    );
}