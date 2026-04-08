import { getJob, updateJob, appendJobEvent } from "@/lib/jobs/store";
import { getMockEvents } from "@/lib/sse/mock-events";
import { encodeSSE } from "@/lib/sse/emitter";
import { isAgentConfigured, hasLocalRepoOverride } from "@/lib/ai/openrouter";
import { runAgent } from "@/lib/agent/run";
import { upsertWikiPage } from "@/lib/gitea/api";
import { cleanupRepoTemp } from "@/lib/gitea/clone";
import type { JobEvent } from "@/lib/jobs/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 600;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;
  const job = getJob(jobId);
  if (!job) {
    return new Response("Not found", { status: 404 });
  }
  if (job.status === "awaiting_selection") {
    return new Response(
      "Job is awaiting project selection. POST to /api/jobs/:id/select first.",
      { status: 409 },
    );
  }

  const useRealAgent =
    (job.mode === "new" || job.mode === "update") &&
    isAgentConfigured() &&
    Boolean(job.repoLocalPath);
  updateJob(jobId, { status: "running" });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let controllerClosed = false;

      const safeEnqueue = (event: JobEvent) => {
        if (controllerClosed) return;
        try {
          controller.enqueue(encodeSSE(event));
        } catch {
          controllerClosed = true;
        }
      };

      const safeClose = () => {
        if (controllerClosed) return;
        try {
          controller.close();
        } catch {}
        controllerClosed = true;
      };

      const emit = (event: JobEvent) => {
        appendJobEvent(jobId, event);
        safeEnqueue(event);
      };

      const fail = (err: unknown) => {
        const errorEvent: JobEvent = {
          type: "error",
          message: err instanceof Error ? err.message : "Unknown error",
          timestamp: Date.now(),
        };
        appendJobEvent(jobId, errorEvent);
        updateJob(jobId, { status: "error" });
        safeEnqueue(errorEvent);
        safeClose();
      };

      // Cleanup helper: removes cloned repo unless it's a local override
      const cleanupClone = async () => {
        if (!hasLocalRepoOverride() && job.repoLocalPath) {
          try {
            await cleanupRepoTemp(job.repoLocalPath);
          } catch {
            // best-effort cleanup
          }
        }
      };

      try {
        if (useRealAgent) {
          // ---- Real agent path ----
          const markdown = await runAgent(job, {
            onEvent: (ev) => emit({ ...ev, timestamp: Date.now() }),
            rootPath: job.repoLocalPath!,
          });
          updateJob(jobId, { status: "done", result: markdown });

          // Publish to Wiki if Gitea is configured and not using local override
          let wikiUrl: string | undefined;
          if (!hasLocalRepoOverride() && process.env.GITEA_TOKEN) {
            try {
              const pageName = job.wikiPageName || "Documentacion-Funcional";
              emit({
                type: "phase",
                message: `Publicando en la Wiki: ${pageName}…`,
                progress: 99,
                timestamp: Date.now(),
              });
              const result = await upsertWikiPage(job.repoUrl, pageName, markdown);
              wikiUrl = result.url;
              updateJob(jobId, { resultUrl: wikiUrl });
            } catch (e) {
              emit({
                type: "error",
                message: `Wiki publish failed: ${e instanceof Error ? e.message : "unknown"}`,
                timestamp: Date.now(),
              });
              // Don't fail the whole job — the markdown was generated successfully
            }
          }

          emit({
            type: "done",
            message: "Documentación generada correctamente",
            progress: 100,
            url: wikiUrl || `/result/${jobId}`,
            timestamp: Date.now(),
          });
          await cleanupClone();
          safeClose();
        } else {
          // ---- Mock path ----
          const steps = getMockEvents(job.mode);
          for (const step of steps) {
            if (step.delayMs > 0) {
              await new Promise((r) => setTimeout(r, step.delayMs));
            }
            const event: JobEvent = {
              type: step.type,
              message: step.message,
              progress: step.progress,
              url: step.url,
              timestamp: Date.now(),
            };
            emit(event);
            if (step.type === "done") {
              updateJob(jobId, { status: "done", resultUrl: step.url });
            }
          }
          safeClose();
        }
      } catch (err) {
        await cleanupClone();
        fail(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
