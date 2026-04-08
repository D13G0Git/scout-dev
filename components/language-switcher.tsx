"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/provider";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
      <Languages className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
      <Button
        size="sm"
        variant={locale === "es" ? "default" : "ghost"}
        className="h-7 rounded-full px-3 text-xs"
        onClick={() => setLocale("es")}
      >
        ES
      </Button>
      <Button
        size="sm"
        variant={locale === "en" ? "default" : "ghost"}
        className="h-7 rounded-full px-3 text-xs"
        onClick={() => setLocale("en")}
      >
        EN
      </Button>
    </div>
  );
}
