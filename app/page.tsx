"use client";

import Link from "next/link";
import { ScoutMark } from "@/components/brand/scout-mark";
import { OrishaLogo } from "@/components/brand/orisha-logo";
import {
  ArrowRight,
  FilePlus2,
  FileUp,
  Search,
  Users,
  UploadCloud,
  Sparkles,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const featureIcons = [Search, Users, UploadCloud] as const;

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="relative overflow-hidden">
      {/* Layered brand background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-orisha-hero" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          {/* Eyebrow pill with gradient border */}
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-brand-gradient bg-card/60 px-4 py-1.5 text-xs font-semibold backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-brand-orange" style={{ color: "var(--brand-orange)" }} />
            <span>{t.landing.eyebrow}</span>
          </div>

          {/* Giant Scout mark with DEV badge */}
          <div className="mb-6 flex items-center justify-center">
            <div className="relative">
              <ScoutMark className="h-24 w-24 drop-shadow-[0_0_40px_rgba(236,72,153,0.35)]" />
              <span
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-md bg-brand-gradient px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white"
                style={{
                  boxShadow:
                    "0 6px 20px -4px color-mix(in oklch, var(--brand-magenta) 60%, transparent)",
                }}
              >
                DEV
              </span>
            </div>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-[56px] md:leading-[1.05]">
            <span className="text-brand-gradient">{t.landing.title}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            {t.landing.subtitle}
          </p>

          {/* Powered by Orisha Agrifood */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Powered by
            </span>
            <OrishaLogo className="h-10 text-foreground" />
          </div>
        </div>

        {/* Mode cards */}
        <div className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-2">
          <ModeCard
            href="/new"
            icon={<FilePlus2 className="h-6 w-6" />}
            title={t.landing.modeNewTitle}
            description={t.landing.modeNewDescription}
            cta={t.landing.modeNewCta}
          />
          <ModeCard
            href="/update"
            icon={<FileUp className="h-6 w-6" />}
            title={t.landing.modeUpdateTitle}
            description={t.landing.modeUpdateDescription}
            cta={t.landing.modeUpdateCta}
          />
        </div>

        {/* Features */}
        <div className="mx-auto mt-28 max-w-4xl">
          <h2 className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {t.landing.featuresTitle}
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {t.landing.features.map((feature, i) => {
              const Icon = featureIcons[i];
              return (
                <Card
                  key={feature.title}
                  className="border-border/60 bg-card/70 backdrop-blur"
                >
                  <CardContent className="p-6">
                    <div
                      className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-lg"
                      style={{
                        boxShadow:
                          "0 8px 24px -8px color-mix(in oklch, var(--brand-magenta) 60%, transparent)",
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold tracking-tight">{feature.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function ModeCard({
  href,
  icon,
  title,
  description,
  cta,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Link href={href} className="group relative block">
      {/* Gradient glow on hover */}
      <div
        className="absolute -inset-px rounded-xl bg-brand-gradient opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-60"
        aria-hidden
      />
      <Card className="relative overflow-hidden border-border/60 bg-card/90 backdrop-blur transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-transparent">
        {/* Top gradient bar */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-brand-gradient opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <CardContent className="relative p-7">
          <div
            className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-white"
            style={{
              boxShadow:
                "0 10px 30px -10px color-mix(in oklch, var(--brand-magenta) 70%, transparent)",
            }}
          >
            {icon}
          </div>
          <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          <div
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: "var(--brand-magenta)" }}
          >
            {cta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
