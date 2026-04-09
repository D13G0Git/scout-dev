import { streamText, stepCountIs } from "ai";
import { agentModel, DEFAULT_MODEL } from "@/lib/ai/openrouter";
import { buildAgentTools, type AgentToolName } from "./tools";
import {
  SYSTEM_PROMPT_NEW,
  SYSTEM_PROMPT_UPDATE,
  buildUserPrompt,
  buildUserPromptUpdate,
} from "./prompts";
import type { Job, JobEvent } from "@/lib/jobs/types";

export type EmitEvent = (event: Omit<JobEvent, "timestamp">) => void;

export interface RunAgentOptions {
  onEvent: EmitEvent;
  signal?: AbortSignal;
  maxSteps?: number;
  /** Absolute path to the repo root the agent can explore */
  rootPath: string;
}

const MAX_STEPS_DEFAULT = 35;

function stripPreamble(text: string): string {
  const firstHeadingIdx = text.search(/^#\s+\S/m);
  if (firstHeadingIdx > 0) {
    return text.slice(firstHeadingIdx).trimEnd();
  }
  return text.trim();
}

/**
 * Runs the Scout DEV agent. Branches on job.mode:
 *   - "new"    → exploration + first-time documentation generation
 *   - "update" → merge previous Word document with current code
 * Streams tool-call events and text_chunk events via `onEvent`.
 * Returns the final Markdown.
 */
export async function runAgent(job: Job, opts: RunAgentOptions): Promise<string> {
  const { onEvent, signal, maxSteps = MAX_STEPS_DEFAULT, rootPath } = opts;

  const modeLabel = job.mode === "update" ? "Modo Update" : "Modo New";
  onEvent({
    type: "phase",
    message: `Inicializando agente Scout DEV (${modeLabel}, modelo: ${DEFAULT_MODEL})`,
    progress: 2,
  });

  const system = job.mode === "update" ? SYSTEM_PROMPT_UPDATE : SYSTEM_PROMPT_NEW;
  const prompt =
    job.mode === "update" ? buildUserPromptUpdate(job) : buildUserPrompt(job);

  const tools = buildAgentTools({
    rootPath,
    wordMarkdown: job.wordMarkdown,
    wordHeadings: job.wordHeadings,
  });

  onEvent({
    type: "phase",
    message:
      job.mode === "update"
        ? "Fusionando Word previo con el código actual…"
        : "Explorando el repositorio…",
    progress: 5,
  });

  let stepIdx = 0;

  const result = streamText({
    model: agentModel(),
    system,
    prompt,
    tools,
    stopWhen: stepCountIs(maxSteps),
    abortSignal: signal,
    onStepFinish({ toolCalls, toolResults, finishReason }) {
      stepIdx += 1;
      const progress = Math.min(90, Math.round((stepIdx / maxSteps) * 85) + 5);

      if (toolCalls && toolCalls.length > 0) {
        for (let i = 0; i < toolCalls.length; i++) {
          const call = toolCalls[i];
          const res = toolResults?.[i];
          const message = describeToolCall(call.toolName as AgentToolName, call.input, res);
          onEvent({ type: "action", message, progress });
        }
      }

      if (finishReason === "stop") {
        onEvent({
          type: "phase",
          message: "Redactando documento final…",
          progress: Math.max(progress, 92),
        });
      }
    },
  });

  // Stream text chunks as the model writes the final document.
  // We consume fullStream to get text-delta parts alongside tool events.
  let accumulatedText = "";
  let chunkCount = 0;

  for await (const part of result.fullStream) {
    if (part.type === "text-delta") {
      accumulatedText += part.text;
      chunkCount++;
      // Emit a text_chunk event every ~20 chunks to show progress without
      // flooding the SSE stream. The actual text is NOT sent (privacy + size);
      // only a progress indicator.
      if (chunkCount % 20 === 0) {
        onEvent({
          type: "text_chunk",
          message: `Escribiendo… (${accumulatedText.length.toLocaleString()} caracteres)`,
          progress: Math.min(97, 92 + Math.round((accumulatedText.length / 15000) * 5)),
        });
      }
    }
  }

  const finalText = stripPreamble(accumulatedText);

  onEvent({
    type: "section",
    message: `Documentación generada (${finalText.length.toLocaleString()} caracteres)`,
    progress: 98,
  });

  return finalText;
}

function describeToolCall(
  name: AgentToolName,
  input: unknown,
  result?: unknown,
): string {
  const args = (input ?? {}) as Record<string, unknown>;
  switch (name) {
    case "read_app_json": {
      const p = (args.path as string) || "app.json";
      return `Leyendo ${p}`;
    }
    case "list_files": {
      const p = (args.path as string) || "/";
      const ext = args.extension as string | undefined;
      const count =
        result && typeof result === "object" && "count" in result
          ? ` (${(result as { count: number }).count} ítems)`
          : "";
      return ext
        ? `Listando ${ext} en ${p || "/"}${count}`
        : `Listando ficheros en ${p || "/"}${count}`;
    }
    case "grep": {
      const pattern = String(args.pattern ?? "");
      const scope = (args.path as string) || "/";
      const count =
        result && typeof result === "object" && "count" in result
          ? ` → ${(result as { count: number }).count} coincidencias`
          : "";
      return `Buscando "${pattern}" en ${scope}${count}`;
    }
    case "read_file": {
      const p = (args.path as string) || "?";
      return `Leyendo ${p}`;
    }
    case "read_previous_doc": {
      const section = args.section as string | undefined;
      if (!section) return "Consultando Word: tabla de contenidos";
      return `Consultando Word: "${section}"`;
    }
    default:
      return `Herramienta: ${name}`;
  }
}
