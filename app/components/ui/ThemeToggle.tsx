"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/app/context/ThemeContext";
import { useI18n } from "@/app/context/LanguageContext";

export type ControlTone = "panel" | "page";

// "panel" sits on the always-dark header; "page" sits directly on the themed page
export const controlToneClass: Record<ControlTone, string> = {
  panel: "text-ly-panel-ink border-white/20 hover:bg-white/10",
  page: "text-ly-ink border-ly-ink/15 bg-ly-card hover:bg-ly-ink/5",
};

export default function ThemeToggle({
  tone = "panel",
  className = "",
}: {
  tone?: ControlTone;
  className?: string;
}) {
  const { theme, toggleTheme } = useTheme();
  const { m } = useI18n();
  const isDark = theme === "dark";
  const label = isDark ? m.common.switchToLight : m.common.switchToDark;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${controlToneClass[tone]} ${className}`}
    >
      {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}
