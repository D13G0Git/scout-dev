import simpleGit from "simple-git";
import path from "node:path";
import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";

/**
 * Clones a Gitea repository to a temporary directory for agent analysis.
 * Uses the GITEA_TOKEN for HTTP basic auth if available.
 * Returns the absolute path to the cloned directory.
 */

const TEMP_BASE = () => path.resolve(process.env.TEMP_CLONE_DIR || "./.tmp/repos");

/**
 * Injects a token into an HTTPS URL for basic auth.
 * Input:  https://git.tipsa.cloud:3000/orisha/EDH
 * Output: https://oauth2:<token>@git.tipsa.cloud:3000/orisha/EDH
 */
function injectToken(repoUrl: string, token: string): string {
  if (!token) return repoUrl;
  try {
    const url = new URL(repoUrl);
    url.username = "oauth2";
    url.password = token;
    return url.toString();
  } catch {
    // If URL parsing fails, return as-is — simple-git will surface the error
    return repoUrl;
  }
}

export async function cloneRepoTemp(repoUrl: string): Promise<string> {
  const token = process.env.GITEA_TOKEN || "";
  const authedUrl = injectToken(repoUrl, token);
  const dir = path.join(TEMP_BASE(), randomUUID());
  await fs.mkdir(dir, { recursive: true });

  const git = simpleGit();
  await git.clone(authedUrl, dir, ["--depth", "1"]);

  return dir;
}

export async function cleanupRepoTemp(dir: string): Promise<void> {
  if (!dir) return;
  // Safety: only delete inside TEMP_BASE to prevent accidental deletion
  const base = TEMP_BASE();
  const resolved = path.resolve(dir);
  if (!resolved.startsWith(base)) {
    throw new Error(`Refusing to delete ${resolved}: not inside ${base}`);
  }
  await fs.rm(resolved, { recursive: true, force: true });
}
