"use client";

import { useI18n } from "@/app/context/LanguageContext";
import type { Locale } from "@/app/i18n/config";
import { controlToneClass, type ControlTone } from "./ThemeToggle";

export default function LanguageSwitcher({
  tone = "panel",
  className = "",
}: {
  tone?: ControlTone;
  className?: string;
}) {
  const { lang, setLang, m } = useI18n();

  const options: { value: Locale; label: string; name: string }[] = [
    { value: "en", label: "EN", name: m.common.english },
    { value: "ne", label: "ने", name: m.common.nepali },
  ];

  return (
    <div
      role="group"
      aria-label={m.common.language}
      className={`inline-flex h-10 shrink-0 items-center rounded-xl border p-0.5 ${controlToneClass[tone].replace(/hover:\S+/g, "")} ${className}`}
    >
      {options.map((option) => {
        const active = option.value === lang;
        return (
          <button
            key={option.value}
            type="button"
            lang={option.value}
            onClick={() => setLang(option.value)}
            aria-pressed={active}
            title={option.name}
            className={`h-full min-w-9 rounded-[10px] px-2.5 text-sm font-semibold transition-colors ${
              active
                ? "bg-ly-brand text-white"
                : "opacity-70 hover:opacity-100"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
