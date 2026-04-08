import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Workspace discovery helper. Detects whether a repo root is:
 *   - a single AL project (app.json at root), or
 *   - a multi-project workspace (one app.json per subfolder, depth ≤ 3).
 *
 * Used BEFORE the agent runs so the UI can prompt the user to
 * choose which projects to document when there are multiple.
 */

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  ".alpackages",
  ".snapshots",
  "bin",
  "obj",
  "out",
  ".vscode",
]);

const MAX_DISCOVERED = 50;

export interface ProjectInfo {
  path: string;
  dir: string;
  name: string;
  publisher: string;
  version: string;
  description?: string;
}

export type WorkspaceScan =
  | { kind: "none"; reason: string }
  | { kind: "single"; project: ProjectInfo }
  | { kind: "workspace"; projects: ProjectInfo[] };

function toRel(root: string, abs: string): string {
  return path.relative(root, abs).replaceAll("\\", "/");
}

async function readManifest(
  root: string,
  absAppJson: string,
): Promise<ProjectInfo | null> {
  try {
    const raw = await fs.readFile(absAppJson, "utf8");
    const parsed = JSON.parse(raw);
    const relPath = toRel(root, absAppJson);
    const dir = path.basename(path.dirname(absAppJson));
    return {
      path: relPath,
      dir,
      name: String(parsed.name ?? dir),
      publisher: String(parsed.publisher ?? "?"),
      version: String(parsed.version ?? "?"),
      description: parsed.description,
    };
  } catch {
    return null;
  }
}

/**
 * Scans a repo root for AL projects.
 * @param rootPath — absolute path to the repo root (cloned dir or TEST_REPO_PATH)
 */
export async function scanWorkspace(rootPath: string): Promise<WorkspaceScan> {
  const root = path.resolve(rootPath);

  try {
    await fs.access(root);
  } catch {
    return { kind: "none", reason: `Path does not exist: ${root}` };
  }

  // 1. Check for app.json at the root
  const rootAppJson = path.join(root, "app.json");
  const rootProject = await readManifest(root, rootAppJson);
  if (rootProject) {
    return { kind: "single", project: rootProject };
  }

  // 2. Multi-project discovery (depth ≤ 3)
  const found: ProjectInfo[] = [];

  async function recurse(dir: string, depth: number) {
    if (depth > 3 || found.length >= MAX_DISCOVERED) return;
    let entries: import("node:fs").Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await recurse(full, depth + 1);
      } else if (entry.isFile() && entry.name === "app.json") {
        const project = await readManifest(root, full);
        if (project) found.push(project);
      }
    }
  }

  await recurse(root, 0);

  if (found.length === 0) {
    return { kind: "none", reason: "No app.json manifests found" };
  }

  found.sort((a, b) => a.dir.localeCompare(b.dir));
  return { kind: "workspace", projects: found };
}
