import { createOpenRouter } from "@openrouter/ai-sdk-provider";

/**
 * OpenRouter client for the Scout DEV agent. Uses the Vercel AI SDK v6
 * Anthropic-compatible interface via @openrouter/ai-sdk-provider.
 *
 * Environment:
 *   OPENROUTER_API_KEY  — required to run the real agent
 *   MODEL               — optional, defaults to "z-ai/glm-4.5-air:free"
 */
export const DEFAULT_MODEL = process.env.MODEL || "z-ai/glm-4.5-air:free";

let _openrouter: ReturnType<typeof createOpenRouter> | null = null;

function getClient() {
  if (!_openrouter) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENROUTER_API_KEY is not set. Cannot initialize OpenRouter client."
      );
    }
    _openrouter = createOpenRouter({ apiKey });
  }
  return _openrouter;
}

export function agentModel() {
  return getClient().chat(DEFAULT_MODEL);
}

/** True when the AI provider is configured (API key available). */
export function isAgentConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

/** True when a local repo override is set (dev mode — skip clone). */
export function hasLocalRepoOverride(): boolean {
  return Boolean(process.env.TEST_REPO_PATH);
}

/** True when Gitea credentials are available for clone + wiki publish. */
export function isGiteaConfigured(): boolean {
  return Boolean(process.env.GITEA_URL && process.env.GITEA_TOKEN);
}
