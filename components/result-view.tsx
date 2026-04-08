"use client";

import * as React from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AlertCircle, CheckCircle2, ExternalLink, FilePlus2, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Job } from "@/lib/jobs/types";

const FALLBACK_MARKDOWN = `# Documentación no disponible

El job se ha completado pero no se ha registrado contenido Markdown.
Esto puede ocurrir si el flujo usó el modo de eventos simulados
(por ejemplo, cuando no hay \`OPENROUTER_API_KEY\` configurado).

Prueba con el flujo real en **Modo New** tras configurar las variables de entorno
\`OPENROUTER_API_KEY\` y \`TEST_REPO_PATH\`.`;

export function ResultView({ jobId }: { jobId: string }) {
  const { t } = useI18n();
  const [job, setJob] = React.useState<Job | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`/api/jobs/${jobId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setJob(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [jobId]);

  const markdown = job?.result && job.result.trim().length > 0 ? job.result : FALLBACK_MARKDOWN;
  const hasError = job?.status === "error";
  const wikiUrl =
    job?.resultUrl ?? "https://git.tipsa.cloud:3000/orisha/bc-ext/wiki/Documentacion-Funcional";

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-10 text-center">
        <div
          className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full ${
            hasError ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-500"
          }`}
        >
          {loading ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : hasError ? (
            <AlertCircle className="h-8 w-8" />
          ) : (
            <CheckCircle2 className="h-8 w-8" />
          )}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {hasError ? "Error generando documentación" : t.result.title}
        </h1>
        <p className="mt-2 text-muted-foreground">{t.result.subtitle}</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <a href={wikiUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4" />
            {t.result.wikiLink}
          </a>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/">
            <FilePlus2 className="h-4 w-4" />
            {t.result.newDocument}
          </Link>
        </Button>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-8">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t.result.preview}
          </h2>
          {loading ? (
            <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t.common.loading}
            </div>
          ) : (
            <article className="prose prose-sm max-w-none dark:prose-invert prose-headings:tracking-tight prose-h1:text-2xl prose-h2:text-xl prose-h3:text-base prose-table:text-xs">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            </article>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
