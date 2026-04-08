import { NextResponse } from "next/server";
import { getJob, updateJob } from "@/lib/jobs/store";

export const runtime = "nodejs";

/**
 * POST /api/jobs/:jobId/select
 * Body: { selectedProjects: string[] }
 * Transitions a job from "awaiting_selection" → "queued" so the SSE stream
 * route can pick it up and run the agent on the chosen projects.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const job = getJob(jobId);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  if (job.status !== "awaiting_selection") {
    return NextResponse.json(
      { error: `Job is not awaiting selection (status=${job.status})` },
      { status: 409 },
    );
  }

  let body: { selectedProjects?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const selected = body.selectedProjects;
  if (!Array.isArray(selected) || selected.length === 0) {
    return NextResponse.json(
      { error: "selectedProjects must be a non-empty array" },
      { status: 400 },
    );
  }

  // Validate every selected path exists in availableProjects
  const available = new Set((job.availableProjects ?? []).map((p) => p.path));
  const invalid = selected.filter((p) => !available.has(p));
  if (invalid.length > 0) {
    return NextResponse.json(
      { error: `Unknown project paths: ${invalid.join(", ")}` },
      { status: 400 },
    );
  }

  updateJob(jobId, {
    status: "queued",
    selectedProjects: selected,
  });

  return NextResponse.json({ ok: true, jobId, selectedCount: selected.length });
}
