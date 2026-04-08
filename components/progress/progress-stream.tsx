"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  FileSearch,
  Hammer,
  Loader2,
  Pencil,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { JobEvent, JobEventType } from "@/lib/jobs/types";
import { cn } from "@/lib/utils";

const iconByType: Record<JobEventType, React.ComponentType<{ className?: string }>> = {
  phase: Hammer,
  action: FileSearch,
  section: Activity,
  done: CheckCircle2,
  error: AlertCircle,
  text_chunk: Pencil,
};

const badgeVariantByType: Record<
  JobEventType,
  "default" | "secondary" | "success" | "warning" | "destructive"
> = {
  phase: "warning",
  action: "secondary",
  section: "default",
  done: "success",
  error: "destructive",
  text_chunk: "default",
};

export function ProgressStream({ jobId }: { jobId: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [events, setEvents] = React.useState<JobEvent[]>([]);
  const [progress, setProgress] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);
  const [status, setStatus] = React.useState<"running" | "done" | "error">("running");
  const listRef = React.useRef<HTMLDivElement>(null);
  const startRef = React.useRef<number>(Date.now());

  React.useEffect(() => {
    const source = new EventSource(`/api/jobs/${jobId}/stream`);
    source.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data) as JobEvent;
        setEvents((prev) => [...prev, parsed]);
        if (typeof parsed.progress === "number") setProgress(parsed.progress);
        if (parsed.type === "done") {
          setStatus("done");
          setTimeout(() => router.push(`/result/${jobId}`), 1400);
          source.close();
        }
        if (parsed.type === "error") {
          setStatus("error");
          source.close();
        }
      } catch {}
    };
    source.onerror = () => {
      source.close();
    };
    return () => source.close();
  }, [jobId, router]);

  React.useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 500);
    return () => clearInterval(id);
  }, [status]);

  React.useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [events]);

  const mm = Math.floor(elapsed / 60)
    .toString()
    .padStart(2, "0");
  const ss = (elapsed % 60).toString().padStart(2, "0");

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          {status === "done" ? (
            <CheckCircle2 className="h-7 w-7" />
          ) : status === "error" ? (
            <AlertCircle className="h-7 w-7 text-destructive" />
          ) : (
            <Loader2 className="h-7 w-7 animate-spin" />
          )}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{t.progress.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.progress.subtitle}</p>
      </div>

      <Card className="mb-6 border-border/60">
        <CardContent className="space-y-3 p-6">
          <div className="flex items-center justify-between text-sm">
            <Badge variant={status === "done" ? "success" : status === "error" ? "destructive" : "default"}>
              {t.progress.status[status]}
            </Badge>
            <span className="font-mono text-xs text-muted-foreground">
              {t.progress.elapsed}: {mm}:{ss}
            </span>
          </div>
          <Progress value={progress} />
          <div className="text-right font-mono text-xs text-muted-foreground">{progress}%</div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="border-b border-border/60 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t.progress.logsTitle}
          </div>
          <div
            ref={listRef}
            className="max-h-[480px] overflow-y-auto divide-y divide-border/50"
          >
            {events.length === 0 && (
              <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t.common.loading}
              </div>
            )}
            {events.map((ev, i) => {
              const Icon = iconByType[ev.type];
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-3 px-6 py-3 text-sm transition-colors",
                    i === events.length - 1 && "bg-accent/20"
                  )}
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={badgeVariantByType[ev.type]} className="text-[10px] uppercase">
                        {t.progress.eventTypes[ev.type]}
                      </Badge>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mt-1 break-words font-medium text-foreground">{ev.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
