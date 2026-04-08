"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { ArrowLeft, FileText, Loader2, Sparkles, UploadCloud, X } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSection, Field } from "./form-section";
import { cn } from "@/lib/utils";

export function UpdateProjectForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [file, setFile] = React.useState<File | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onDrop = React.useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
  });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const repoUrl = String(fd.get("repoUrl") || "");
    const newFeatures = String(fd.get("newFeatures") || "");
    const removedFeatures = String(fd.get("removedFeatures") || "");
    const wikiPageName = String(fd.get("wikiPageName") || "");

    try {
      setError(null);
      const body = new FormData();
      body.append(
        "payload",
        JSON.stringify({
          mode: "update",
          repoUrl,
          newFeatures,
          removedFeatures,
          wikiPageName,
          fileName: file.name,
        }),
      );
      body.append("file", file);

      const res = await fetch("/api/jobs", { method: "POST", body });
      const data = await res.json();
      if (res.ok && data.id) {
        if (data.needsSelection) {
          router.push(`/select/${data.id}`);
        } else {
          router.push(`/progress/${data.id}`);
        }
      } else {
        setError(data.error || `Error ${res.status}: ${res.statusText}`);
        setSubmitting(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error de red");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.common.back}
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">{t.update.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.update.subtitle}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <FormSection title="Gitea + Word">
          <Field label={t.update.repoUrl} htmlFor="repoUrl" required>
            <Input
              id="repoUrl"
              name="repoUrl"
              type="url"
              placeholder="https://gitea.example.com/org/repo"
              required
            />
          </Field>
          <Field label={t.update.wordUpload} required>
            <div
              {...getRootProps()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-background/50 px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-accent/30",
                isDragActive && "border-primary bg-primary/5"
              )}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <UploadCloud className="mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">{t.update.wordUploadPlaceholder}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t.update.wordUploadHint}</p>
                </>
              )}
            </div>
          </Field>
        </FormSection>

        <FormSection title="Delta context">
          <Field
            label={t.update.newFeatures}
            hint={t.update.newFeaturesHelp}
            htmlFor="newFeatures"
          >
            <Textarea id="newFeatures" name="newFeatures" rows={3} />
          </Field>
          <Field label={t.update.removedFeatures} htmlFor="removedFeatures">
            <Textarea id="removedFeatures" name="removedFeatures" rows={2} />
          </Field>
        </FormSection>

        <FormSection title={t.update.wikiPageName ?? "Wiki"}>
          <Field
            label={t.update.wikiPageName}
            hint={t.update.wikiPageNameHelp}
            htmlFor="wikiPageName"
          >
            <Input
              id="wikiPageName"
              name="wikiPageName"
              placeholder={t.update.wikiPageNamePlaceholder}
            />
          </Field>
        </FormSection>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            <p className="font-medium">Error al crear el job</p>
            <p className="mt-1 text-xs opacity-80">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button type="submit" size="lg" disabled={submitting || !file}>
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {t.common.submit}
          </Button>
        </div>
      </form>
    </div>
  );
}
