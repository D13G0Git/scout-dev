import type { Job, CreateJobPayload } from "./types";
import { generateId } from "@/lib/utils";

// In-memory job store. Lives on the server process; suitable only for the
// mockup. In production this should be replaced by Redis / DB.
declare global {
  // eslint-disable-next-line no-var
  var __jobStore: Map<string, Job> | undefined;
}

const store: Map<string, Job> =
  globalThis.__jobStore ?? (globalThis.__jobStore = new Map());

export function createJob(payload: CreateJobPayload): Job {
  // Store the full form payload for the agent to consume via buildUserPrompt()
  const {
    mode,
    repoUrl,
    clientName,
    outputLanguage,
    wordMarkdown,
    wordHeadings,
    wordFilename,
    wikiPageName,
    ...rest
  } = payload;
  const job: Job = {
    id: generateId(),
    mode,
    status: "queued",
    createdAt: Date.now(),
    repoUrl,
    clientName: clientName as string | undefined,
    outputLanguage: (outputLanguage as "es" | "en" | undefined) ?? "es",
    events: [],
    formData: { ...rest, clientName, repoUrl, outputLanguage, wordFilename },
    wordMarkdown: wordMarkdown as string | undefined,
    wordHeadings: wordHeadings as Job["wordHeadings"],
    wordFilename: wordFilename as string | undefined,
    wikiPageName: (wikiPageName as string | undefined) || undefined,
  };
  store.set(job.id, job);
  return job;
}

export function getJob(id: string): Job | undefined {
  return store.get(id);
}

export function updateJob(id: string, patch: Partial<Job>): Job | undefined {
  const job = store.get(id);
  if (!job) return undefined;
  const next = { ...job, ...patch };
  store.set(id, next);
  return next;
}

export function appendJobEvent(id: string, event: Job["events"][number]) {
  const job = store.get(id);
  if (!job) return;
  job.events.push(event);
  store.set(id, job);
}
