"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormSection, Field } from "./form-section";

const MODULE_KEYS = [
  "modulesSales",
  "modulesPurchases",
  "modulesWarehouse",
  "modulesProduction",
  "modulesFinance",
  "modulesProjects",
  "modulesHR",
  "modulesCustom",
] as const;

export function NewProjectForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [modules, setModules] = React.useState<Record<string, boolean>>({});

  const toggleModule = (key: string) =>
    setModules((m) => ({ ...m, [key]: !m[key] }));

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      mode: "new" as const,
      repoUrl: String(fd.get("repoUrl") || ""),
      clientName: String(fd.get("clientName") || ""),
      description: String(fd.get("description") || ""),
      bcVersion: String(fd.get("bcVersion") || ""),
      projectType: String(fd.get("projectType") || "extension"),
      modules,
      businessFlow: String(fd.get("businessFlow") || ""),
      integrations: String(fd.get("integrations") || ""),
      tables: String(fd.get("tables") || ""),
      codeunits: String(fd.get("codeunits") || ""),
      setupPages: String(fd.get("setupPages") || ""),
      jobQueue: String(fd.get("jobQueue") || "no"),
      readerLevel: String(fd.get("readerLevel") || "key"),
      excludedFeatures: String(fd.get("excludedFeatures") || ""),
      terminology: String(fd.get("terminology") || ""),
      outputLanguage: (String(fd.get("outputLanguage") || "es") as "es" | "en"),
      wikiPageName: String(fd.get("wikiPageName") || ""),
    };

    try {
      setError(null);
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
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
        <h1 className="text-3xl font-semibold tracking-tight">{t.new.title}</h1>
        <p className="mt-2 text-muted-foreground">{t.new.subtitle}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Block 1 */}
        <FormSection title={t.new.block1}>
          <Field label={t.new.fields.clientName} htmlFor="clientName" required>
            <Input id="clientName" name="clientName" required />
          </Field>
          <Field
            label={t.new.fields.description}
            hint={t.new.fields.descriptionHelp}
            htmlFor="description"
            required
          >
            <Textarea id="description" name="description" rows={3} required />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t.new.fields.bcVersion} htmlFor="bcVersion">
              <Input id="bcVersion" name="bcVersion" placeholder="BC23 / BC24…" />
            </Field>
            <Field label={t.new.fields.projectType}>
              <RadioGroup name="projectType" defaultValue="extension" className="flex gap-5 pt-2">
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="extension" />
                  {t.new.fields.projectTypeExtension}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="custom" />
                  {t.new.fields.projectTypeCustom}
                </label>
              </RadioGroup>
            </Field>
          </div>
          <Field label={t.new.fields.repoUrl} htmlFor="repoUrl" required>
            <Input
              id="repoUrl"
              name="repoUrl"
              type="url"
              placeholder="https://gitea.example.com/org/repo"
              required
            />
          </Field>
        </FormSection>

        {/* Block 2 */}
        <FormSection title={t.new.block2}>
          <Field label={t.new.fields.modules}>
            <div className="grid grid-cols-2 gap-3 pt-1 sm:grid-cols-4">
              {MODULE_KEYS.map((key) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm hover:bg-accent/40"
                >
                  <Checkbox
                    checked={!!modules[key]}
                    onCheckedChange={() => toggleModule(key)}
                  />
                  {t.new.fields[key]}
                </label>
              ))}
            </div>
          </Field>
          <Field
            label={t.new.fields.businessFlow}
            hint={t.new.fields.businessFlowHelp}
            htmlFor="businessFlow"
          >
            <Textarea id="businessFlow" name="businessFlow" rows={3} />
          </Field>
          <Field
            label={t.new.fields.integrations}
            hint={t.new.fields.integrationsHelp}
            htmlFor="integrations"
          >
            <Textarea id="integrations" name="integrations" rows={2} />
          </Field>
        </FormSection>

        {/* Block 3 */}
        <FormSection title={t.new.block3}>
          <Field
            label={t.new.fields.tables}
            hint={t.new.fields.tablesHelp}
            htmlFor="tables"
          >
            <Textarea id="tables" name="tables" rows={3} />
          </Field>
          <Field
            label={t.new.fields.codeunits}
            hint={t.new.fields.codeunitsHelp}
            htmlFor="codeunits"
          >
            <Textarea id="codeunits" name="codeunits" rows={3} />
          </Field>
          <Field
            label={t.new.fields.setupPages}
            hint={t.new.fields.setupPagesHelp}
            htmlFor="setupPages"
          >
            <Textarea id="setupPages" name="setupPages" rows={2} />
          </Field>
          <Field label={t.new.fields.jobQueue}>
            <RadioGroup name="jobQueue" defaultValue="no" className="flex gap-5 pt-2">
              <label className="flex items-center gap-2 text-sm">
                <RadioGroupItem value="yes" /> Sí / Yes
              </label>
              <label className="flex items-center gap-2 text-sm">
                <RadioGroupItem value="no" /> No
              </label>
            </RadioGroup>
          </Field>
        </FormSection>

        {/* Block 4 */}
        <FormSection title={t.new.block4}>
          <Field label={t.new.fields.readerLevel}>
            <RadioGroup name="readerLevel" defaultValue="key" className="flex flex-wrap gap-5 pt-2">
              <label className="flex items-center gap-2 text-sm">
                <RadioGroupItem value="key" /> {t.new.fields.readerKey}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <RadioGroupItem value="it" /> {t.new.fields.readerIT}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <RadioGroupItem value="director" /> {t.new.fields.readerDirector}
              </label>
            </RadioGroup>
          </Field>
          <Field
            label={t.new.fields.excludedFeatures}
            hint={t.new.fields.excludedFeaturesHelp}
            htmlFor="excludedFeatures"
          >
            <Textarea id="excludedFeatures" name="excludedFeatures" rows={2} />
          </Field>
          <Field
            label={t.new.fields.terminology}
            hint={t.new.fields.terminologyHelp}
            htmlFor="terminology"
          >
            <Textarea id="terminology" name="terminology" rows={2} />
          </Field>
          <Field label={t.new.fields.outputLanguage}>
            <RadioGroup
              name="outputLanguage"
              defaultValue="es"
              className="flex gap-5 pt-2"
            >
              <label className="flex items-center gap-2 text-sm">
                <RadioGroupItem value="es" /> {t.new.fields.outputLanguageEs}
              </label>
              <label className="flex items-center gap-2 text-sm">
                <RadioGroupItem value="en" /> {t.new.fields.outputLanguageEn}
              </label>
            </RadioGroup>
          </Field>
        </FormSection>

        {/* Wiki page name */}
        <FormSection title={t.new.fields.wikiPageName ?? "Wiki"}>
          <Field
            label={t.new.fields.wikiPageName}
            hint={t.new.fields.wikiPageNameHelp}
            htmlFor="wikiPageName"
          >
            <Input
              id="wikiPageName"
              name="wikiPageName"
              placeholder={t.new.fields.wikiPageNamePlaceholder}
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
          <Button type="submit" size="lg" disabled={submitting}>
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
