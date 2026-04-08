import { NextResponse } from "next/server";
import { createJob, updateJob } from "@/lib/jobs/store";
import { scanWorkspace } from "@/lib/agent/workspace";
import { isAgentConfigured, hasLocalRepoOverride, isGiteaConfigured } from "@/lib/ai/openrouter";
import { cloneRepoTemp } from "@/lib/gitea/clone";
import {
  parseDocxToMarkdown,
  MAX_DOCX_BYTES,
  DocxTooLargeError,
} from "@/lib/parsers/word";
import type { CreateJobPayload } from "@/lib/jobs/types";

export const runtime = "nodejs";

type ParseResult =
  | { ok: true; payload: CreateJobPayload }
  | { ok: false; status: number; error: string };

async function parseRequestPayload(request: Request): Promise<ParseResult> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.startsWith("multipart/form-data")) {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return { ok: false, status: 400, error: "Invalid multipart form data" };
    }

    const payloadRaw = form.get("payload");
    if (typeof payloadRaw !== "string") {
      return { ok: false, status: 400, error: "Missing 'payload' field in multipart body" };
    }

    let payload: CreateJobPayload;
    try {
      payload = JSON.parse(payloadRaw) as CreateJobPayload;
    } catch {
      return { ok: false, status: 400, error: "Invalid JSON in 'payload' field" };
    }

    const file = form.get("file");
    if (file instanceof File) {
      if (!file.name.toLowerCase().endsWith(".docx")) {
        return { ok: false, status: 400, error: "Only .docx files are accepted" };
      }
      if (file.size > MAX_DOCX_BYTES) {
        return { ok: false, status: 413, error: `File too large (${file.size} bytes, max ${MAX_DOCX_BYTES}).` };
      }
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const parsed = await parseDocxToMarkdown(buffer);
        payload.wordMarkdown = parsed.markdown;
        payload.wordHeadings = parsed.headings;
        payload.wordFilename = file.name;
      } catch (e) {
        if (e instanceof DocxTooLargeError) {
          return { ok: false, status: 413, error: e.message };
        }
        return {
          ok: false,
          status: 400,
          error: `Failed to parse .docx: ${e instanceof Error ? e.message : "unknown error"}`,
        };
      }
    }

    return { ok: true, payload };
  }

  try {
    const payload = (await request.json()) as CreateJobPayload;
    return { ok: true, payload };
  } catch {
    return { ok: false, status: 400, error: "Invalid JSON payload" };
  }
}

export async function POST(request: Request) {
  const parsed = await parseRequestPayload(request);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }
  const body = parsed.payload;

  if (!body.mode || (body.mode !== "new" && body.mode !== "update")) {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }
  if (!body.repoUrl || typeof body.repoUrl !== "string") {
    return NextResponse.json({ error: "repoUrl is required" }, { status: 400 });
  }
  if (body.mode === "update" && !body.wordMarkdown) {
    return NextResponse.json(
      { error: "Modo Update requires a .docx file" },
      { status: 400 },
    );
  }

  const job = createJob(body);

  // --- Resolve repo root path ---
  // Priority: 1) TEST_REPO_PATH (dev override), 2) Gitea clone, 3) null (mock fallback)
  if (isAgentConfigured()) {
    let rootPath: string | null = null;

    if (hasLocalRepoOverride()) {
      rootPath = process.env.TEST_REPO_PATH!;
    } else if (isGiteaConfigured()) {
      try {
        rootPath = await cloneRepoTemp(body.repoUrl);
      } catch (e) {
        return NextResponse.json(
          { error: `Failed to clone repo: ${e instanceof Error ? e.message : "unknown"}` },
          { status: 502 },
        );
      }
    }

    if (rootPath) {
      updateJob(job.id, { repoLocalPath: rootPath });

      const scan = await scanWorkspace(rootPath);
      if (scan.kind === "workspace") {
        updateJob(job.id, {
          status: "awaiting_selection",
          availableProjects: scan.projects,
        });
        return NextResponse.json({
          id: job.id,
          needsSelection: true,
          projects: scan.projects,
        });
      }
      if (scan.kind === "single") {
        updateJob(job.id, {
          availableProjects: [scan.project],
          selectedProjects: [scan.project.path],
        });
      }
    }
  }

  return NextResponse.json({ id: job.id, needsSelection: false });
}
