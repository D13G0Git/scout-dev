import type { JobEvent } from "@/lib/jobs/types";

export function sseFormat(event: JobEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export function encodeSSE(event: JobEvent): Uint8Array {
  return new TextEncoder().encode(sseFormat(event));
}
