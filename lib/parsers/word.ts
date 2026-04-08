import mammoth from "mammoth";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

/**
 * Parse a .docx buffer into Markdown that preserves headings, lists, tables
 * and basic inline formatting. The output feeds the Scout DEV agent's
 * read_previous_doc tool in Modo Update.
 */

export const MAX_DOCX_BYTES = 20 * 1024 * 1024; // 20 MB

export interface DocxHeading {
  level: number;
  text: string;
  line: number;
}

export interface ParsedDocx {
  markdown: string;
  headings: DocxHeading[];
  warnings: string[];
  byteCount: number;
}

export class DocxTooLargeError extends Error {
  constructor(public readonly bytes: number) {
    super(`.docx exceeds the ${MAX_DOCX_BYTES} byte limit (received ${bytes})`);
    this.name = "DocxTooLargeError";
  }
}

let _turndown: TurndownService | null = null;

function getTurndown(): TurndownService {
  if (_turndown) return _turndown;
  const service = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    emDelimiter: "_",
    strongDelimiter: "**",
  });
  service.use(gfm);
  _turndown = service;
  return service;
}

/**
 * Extracts headings from a Markdown string, preserving their source line
 * number so the read_previous_doc tool can slice sections precisely.
 */
export function extractHeadings(markdown: string): DocxHeading[] {
  const lines = markdown.split(/\r?\n/);
  const headings: DocxHeading[] = [];
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
        line: i + 1,
      });
    }
  }
  return headings;
}

/**
 * Converts a .docx buffer to Markdown using mammoth → turndown with GFM
 * extensions (tables, strikethrough, task lists).
 */
export async function parseDocxToMarkdown(buffer: Buffer): Promise<ParsedDocx> {
  if (buffer.length > MAX_DOCX_BYTES) {
    throw new DocxTooLargeError(buffer.length);
  }

  const mammothResult = await mammoth.convertToHtml(
    { buffer },
    {
      // Preserve heading structure as real <h1>-<h6> instead of styled paragraphs
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Heading 4'] => h4:fresh",
        "p[style-name='Heading 5'] => h5:fresh",
        "p[style-name='Heading 6'] => h6:fresh",
        "p[style-name='Title'] => h1:fresh",
      ],
    },
  );

  const html = mammothResult.value;
  const warnings = (mammothResult.messages ?? []).map((m) => `${m.type}: ${m.message}`);

  const markdown = getTurndown().turndown(html).trim();
  const headings = extractHeadings(markdown);

  return {
    markdown,
    headings,
    warnings,
    byteCount: buffer.length,
  };
}

/**
 * Slices a markdown document to return a single section: from a matching
 * heading down to the next heading of the SAME or HIGHER level.
 * Used by the read_previous_doc tool.
 */
export function sliceSection(
  markdown: string,
  headings: DocxHeading[],
  query: string,
): { found: true; heading: DocxHeading; content: string } | { found: false } {
  const needle = query.trim().toLowerCase();
  const idx = headings.findIndex((h) => h.text.toLowerCase() === needle);
  const headingIdx =
    idx >= 0
      ? idx
      : headings.findIndex((h) => h.text.toLowerCase().includes(needle));
  if (headingIdx < 0) return { found: false };

  const heading = headings[headingIdx];
  const lines = markdown.split(/\r?\n/);
  const startLine = heading.line - 1; // 0-indexed

  // Find the next heading of same or higher level (smaller or equal number)
  let endLine = lines.length;
  for (let j = headingIdx + 1; j < headings.length; j++) {
    if (headings[j].level <= heading.level) {
      endLine = headings[j].line - 1;
      break;
    }
  }

  const content = lines.slice(startLine, endLine).join("\n").trim();
  return { found: true, heading, content };
}

// Legacy export kept for API compatibility
export async function extractDocxText(buffer: Buffer): Promise<string> {
  const { markdown } = await parseDocxToMarkdown(buffer);
  return markdown;
}
