"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckSquare,
  FolderTree,
  Loader2,
  Package,
  Square,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Job, ProjectSelection } from "@/lib/jobs/types";
import { cn } from "@/lib/utils";

export function ProjectSelectionView({ jobId }: { jobId: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [job, setJob] = React.useState<Job | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch(`/api/jobs/${jobId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Job | null) => {
        setJob(data);
        setLoading(false);
        // Pre-select all projects by default — user can untick
        if (data?.availableProjects) {
          setSelected(new Set(data.availableProjects.map((p) => p.path)));
        }
      })
      .catch(() => setLoading(false));
  }, [jobId]);

  const projects = job?.availableProjects ?? [];
  const allSelected = selected.size === projects.length && projects.length > 0;

  const toggle = (path: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(projects.map((p) => p.path)));

  const onSubmit = async () => {
    if (selected.size === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedProjects: Array.from(selected) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `HTTP ${res.status}`);
        setSubmitting(false);
        return;
      }
      router.push(`/progress/${jobId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-3xl items-center justify-center px-6 py-24 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {t.common.loading}
      </div>
    );
  }

  if (!job || job.status !== "awaiting_selection") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-muted-foreground">{t.select.notAwaiting}</p>
        <Button asChild className="mt-4">
          <Link href="/">{t.common.back}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/new"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.common.back}
      </Link>

      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-gradient bg-card/60 px-3 py-1 text-xs font-semibold backdrop-blur">
          <FolderTree className="h-3.5 w-3.5" style={{ color: "var(--brand-orange)" }} />
          <span>{t.select.eyebrow}</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{t.select.title}</h1>
        <p className="mt-2 text-muted-foreground">
          {t.select.subtitle.replace("{count}", String(projects.length))}
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={toggleAll}
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {allSelected ? (
            <CheckSquare className="h-3.5 w-3.5" />
          ) : (
            <Square className="h-3.5 w-3.5" />
          )}
          {allSelected ? t.select.deselectAll : t.select.selectAll}
        </button>
        <Badge variant={selected.size > 0 ? "default" : "secondary"}>
          {t.select.selectedCount.replace("{n}", String(selected.size))}
        </Badge>
      </div>

      <div className="space-y-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.path}
            project={project}
            selected={selected.has(project.path)}
            onToggle={() => toggle(project.path)}
          />
        ))}
      </div>

      {error && (
        <p className="mt-4 text-sm text-destructive">{error}</p>
      )}

      <div className="mt-8 flex items-center justify-end gap-3">
        <Button
          size="lg"
          onClick={onSubmit}
          disabled={submitting || selected.size === 0}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          {t.select.continueCta}
        </Button>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  selected,
  onToggle,
}: {
  project: ProjectSelection;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <Card
      className={cn(
        "cursor-pointer border transition-all",
        selected
          ? "border-primary/60 bg-accent/30"
          : "border-border/60 hover:border-border",
      )}
      onClick={onToggle}
    >
      <CardContent className="flex items-start gap-4 p-5">
        <div
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
            selected
              ? "border-primary bg-brand-gradient text-white"
              : "border-border bg-background",
          )}
          aria-hidden
        >
          {selected && <CheckSquare className="h-3.5 w-3.5" strokeWidth={3} />}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Package className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold tracking-tight">{project.name}</h3>
            <Badge variant="outline" className="shrink-0 font-mono text-[10px]">
              v{project.version}
            </Badge>
          </div>
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
            {project.path}
          </p>
          {project.description && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {project.description}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            {project.publisher}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
