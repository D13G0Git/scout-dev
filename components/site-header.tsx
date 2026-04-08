"use client";

import Link from "next/link";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { ScoutMark } from "./brand/scout-mark";
import { OrishaLogo } from "./brand/orisha-logo";
import { useI18n } from "@/lib/i18n/provider";

export function SiteHeader() {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-3">
          <ScoutMark className="h-9 w-9 transition-transform group-hover:rotate-[8deg]" />
          <div className="flex flex-col leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight">Scout</span>
              <span
                className="rounded-md bg-brand-gradient px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white shadow-sm"
                style={{
                  boxShadow:
                    "0 2px 8px -2px color-mix(in oklch, var(--brand-magenta) 55%, transparent)",
                }}
              >
                DEV
              </span>
            </div>
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {t.brand.tagline}
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <div className="mr-2 hidden items-center gap-2 sm:flex">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              by
            </span>
            <OrishaLogo className="h-8 text-foreground" />
          </div>
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
