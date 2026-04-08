import { promises as fs } from "node:fs";
import path from "node:path";
import { tool } from "ai";
import { z } from "zod";
import { buildReadPreviousDocTool } from "./read-previous-doc";
import type { DocxHeading } from "@/lib/parsers/word";

/**
 * Filesystem-sandboxed tools for the Scout DEV agent.
 * All paths are resolved against the rootPath provided via AgentToolContext.
 * Any attempt to escape the sandbox throws before touching disk.
 */

const MAX_FILE_BYTES = 200 * 1024; // 200 KB
const MAX_GREP_RESULTS = 50;
const MAX_LIST_ENTRIES = 500;
const SEARCHABLE_EXTENSIONS = new Set([".al", ".json", ".md", ".xml"]);
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

export interface AgentToolContext {
  /** Absolute path to the repo root (cloned dir or TEST_REPO_PATH) */
  rootPath: string;
  /** Modo Update only: extracted markdown of the uploaded .docx */
  wordMarkdown?: string;
  /** Modo Update only: headings parsed from the Word for the TOC tool */
  wordHeadings?: DocxHeading[];
}

export type AgentToolName =
  | "list_files"
  | "read_file"
  | "grep"
  | "read_app_json"
  | "read_previous_doc";

// --- Internal helpers parameterized by rootPath ---

function makeSafePath(root: string) {
  return (relative: string): string => {
    const cleaned = (relative || "").replace(/^[/\\]+/, "");
    const resolved = path.resolve(root, cleaned);
    if (resolved !== root && !resolved.startsWith(root + path.sep)) {
      throw new Error(`Path escapes sandbox: ${relative}`);
    }
    return resolved;
  };
}

function makeRel(root: string) {
  return (absPath: string): string => path.relative(root, absPath).replaceAll("\\", "/");
}

async function walk(
  dir: string,
  cb: (absPath: string, stat: import("node:fs").Stats) => Promise<boolean | void>,
): Promise<boolean | undefined> {
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
      const stopped = await walk(full, cb);
      if (stopped === false) return false;
    } else if (entry.isFile()) {
      const stat = await fs.stat(full);
      const result = await cb(full, stat);
      if (result === false) return false;
    }
  }
  return true;
}

// --- Helpers for read_app_json workspace discovery ---

async function discoverAppJsons(
  root: string,
  safePath: (r: string) => string,
  rel: (a: string) => string,
): Promise<{ path: string; name: string; publisher: string; version: string }[]> {
  const found: { path: string; name: string; publisher: string; version: string }[] = [];

  async function recurse(dir: string, depth: number) {
    if (depth > 3 || found.length >= 30) return;
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
        try {
          const raw = await fs.readFile(full, "utf8");
          const parsed = JSON.parse(raw);
          found.push({
            path: rel(full),
            name: parsed.name ?? "?",
            publisher: parsed.publisher ?? "?",
            version: parsed.version ?? "?",
          });
        } catch {
          // ignore invalid JSON
        }
      }
    }
  }

  await recurse(root, 0);
  return found;
}

function parseManifest(path_: string, raw: string) {
  const parsed = JSON.parse(raw);
  return {
    path: path_,
    name: parsed.name,
    publisher: parsed.publisher,
    version: parsed.version,
    id: parsed.id,
    description: parsed.description,
    platform: parsed.platform,
    application: parsed.application,
    dependencies: parsed.dependencies ?? [],
    idRanges: parsed.idRanges ?? [],
  };
}

/**
 * Builds the toolset for a specific agent run. The root path comes from
 * the context (cloned repo or TEST_REPO_PATH), not from env vars.
 * When a Word document is present (Modo Update), `read_previous_doc` is added.
 */
export function buildAgentTools(ctx: AgentToolContext) {
  const root = path.resolve(ctx.rootPath);
  const safePath = makeSafePath(root);
  const rel = makeRel(root);

  // --- Tool: list_files ---
  const listFilesTool = tool({
    description:
      "List files inside the repository. Returns relative paths from the repo root. Optionally filter by extension (e.g. '.al', '.json'). Use this to discover the structure of the project.",
    inputSchema: z.object({
      path: z
        .string()
        .default("")
        .describe("Relative subdirectory from the repo root. Empty string = repo root."),
      extension: z
        .string()
        .optional()
        .describe("Optional file extension filter, including the dot (e.g. '.al')."),
    }),
    execute: async ({ path: relPath, extension }) => {
      const abs = safePath(relPath || "");
      const ext = extension?.startsWith(".") ? extension : extension ? `.${extension}` : undefined;
      const results: string[] = [];
      await walk(abs, async (full) => {
        if (ext && path.extname(full).toLowerCase() !== ext.toLowerCase()) return;
        results.push(rel(full));
        if (results.length >= MAX_LIST_ENTRIES) return false;
      });
      return { count: results.length, truncated: results.length >= MAX_LIST_ENTRIES, files: results };
    },
  });

  // --- Tool: read_file ---
  const readFileTool = tool({
    description:
      "Read the contents of a single file from the repository. Returns plain text. Large files are truncated at 200KB. Binary files are rejected.",
    inputSchema: z.object({
      path: z.string().describe("Relative path from the repo root, e.g. 'codeunits/PriceCalc.al'."),
    }),
    execute: async ({ path: relPath }) => {
      const abs = safePath(relPath);
      const stat = await fs.stat(abs);
      if (!stat.isFile()) throw new Error(`Not a file: ${relPath}`);
      const buf = await fs.readFile(abs);
      const sample = buf.subarray(0, Math.min(buf.length, 8192));
      if (sample.includes(0)) throw new Error(`Refusing to read binary file: ${relPath}`);
      const truncated = buf.length > MAX_FILE_BYTES;
      const text = buf.subarray(0, MAX_FILE_BYTES).toString("utf8");
      return {
        path: relPath,
        bytes: buf.length,
        truncated,
        content: truncated ? text + "\n\n... [truncated at 200KB]" : text,
      };
    },
  });

  // --- Tool: grep ---
  const grepTool = tool({
    description:
      "Search for a text pattern (regex) across AL, JSON, XML and Markdown files in the repository. Returns up to 50 matches with file path, line number and a snippet.",
    inputSchema: z.object({
      pattern: z.string().describe("Regex pattern to search."),
      path: z.string().default("").describe("Optional relative subdirectory to restrict the search."),
      caseInsensitive: z.boolean().default(true),
      maxResults: z.number().int().positive().max(MAX_GREP_RESULTS).default(MAX_GREP_RESULTS),
    }),
    execute: async ({ pattern, path: relPath, caseInsensitive, maxResults }) => {
      const abs = safePath(relPath || "");
      let regex: RegExp;
      try {
        regex = new RegExp(pattern, caseInsensitive ? "i" : "");
      } catch (e) {
        throw new Error(`Invalid regex: ${pattern} (${e instanceof Error ? e.message : "unknown"})`);
      }
      const matches: { file: string; line: number; snippet: string }[] = [];
      await walk(abs, async (full, stat) => {
        if (!SEARCHABLE_EXTENSIONS.has(path.extname(full).toLowerCase())) return;
        if (stat.size > MAX_FILE_BYTES) return;
        let content: string;
        try { content = await fs.readFile(full, "utf8"); } catch { return; }
        const lines = content.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
          if (regex.test(lines[i])) {
            matches.push({ file: rel(full), line: i + 1, snippet: lines[i].trim().slice(0, 240) });
            if (matches.length >= maxResults) return false;
          }
        }
      });
      return { count: matches.length, truncated: matches.length >= maxResults, matches };
    },
  });

  // --- Tool: read_app_json ---
  const readAppJsonTool = tool({
    description:
      "Read and parse an app.json manifest. If you omit 'path' and the root has no app.json, this tool auto-discovers all app.json files in the workspace (up to depth 3).",
    inputSchema: z.object({
      path: z.string().default("").describe("Relative path to the app.json. Empty = auto-detect."),
    }),
    execute: async ({ path: relPath }) => {
      if (relPath) {
        const abs = safePath(relPath);
        const raw = await fs.readFile(abs, "utf8");
        try {
          return { kind: "manifest" as const, ...parseManifest(relPath, raw) };
        } catch (e) {
          throw new Error(`Failed to parse ${relPath}: ${e instanceof Error ? e.message : "invalid JSON"}`);
        }
      }
      // Auto-detect
      const rootAppJson = safePath("app.json");
      try {
        const raw = await fs.readFile(rootAppJson, "utf8");
        return { kind: "manifest" as const, ...parseManifest("app.json", raw) };
      } catch {
        const projects = await discoverAppJsons(root, safePath, rel);
        if (projects.length === 0) {
          throw new Error("No app.json found anywhere in the repository (searched up to depth 3).");
        }
        if (projects.length === 1) {
          const abs = safePath(projects[0].path);
          const raw = await fs.readFile(abs, "utf8");
          return { kind: "manifest" as const, ...parseManifest(projects[0].path, raw) };
        }
        return {
          kind: "workspace" as const,
          projectCount: projects.length,
          message: "This repository is a multi-project AL workspace. Multiple app.json files were found.",
          projects,
        };
      }
    },
  });

  // --- Compose ---
  const base = {
    list_files: listFilesTool,
    read_file: readFileTool,
    grep: grepTool,
    read_app_json: readAppJsonTool,
  };

  if (ctx.wordMarkdown && ctx.wordHeadings) {
    return {
      ...base,
      read_previous_doc: buildReadPreviousDocTool(ctx.wordMarkdown, ctx.wordHeadings),
    };
  }
  return base;
}
