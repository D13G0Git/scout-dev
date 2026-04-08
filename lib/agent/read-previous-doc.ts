import { tool } from "ai";
import { z } from "zod";
import { sliceSection, type DocxHeading } from "@/lib/parsers/word";

const MAX_SECTION_CHARS = 8000;

/**
 * Builds the `read_previous_doc` tool bound to the Word content of a specific
 * Modo Update job. The tool exposes two modes:
 *   - Called without `section` → returns a table of contents (heading list)
 *     plus metadata (total lines, heading count) so the agent can decide
 *     what to dig into.
 *   - Called with `section` → returns the verbatim content of that section
 *     (from its heading down to the next same-or-higher level heading),
 *     truncated to 8000 chars.
 *
 * This lets the agent consult the previous documentation on demand without
 * saturating its initial context.
 */
export function buildReadPreviousDocTool(
  wordMarkdown: string,
  headings: DocxHeading[],
) {
  return tool({
    description:
      "Read the previous documentation (Word document) that the user uploaded for this update. Call WITHOUT arguments first to get the table of contents (list of headings with their level and text). Then call WITH `section` set to a heading text (exact or partial match, case-insensitive) to retrieve that section's verbatim content. Use this to check what was already documented and decide what still applies, what needs to be updated, and what is missing.",
    inputSchema: z.object({
      section: z
        .string()
        .optional()
        .describe(
          "Optional heading text to retrieve. Omit to get the table of contents.",
        ),
    }),
    execute: async ({ section }) => {
      if (!section) {
        // TOC mode
        const totalLines = wordMarkdown.split(/\r?\n/).length;
        return {
          mode: "toc" as const,
          totalLines,
          totalChars: wordMarkdown.length,
          headingCount: headings.length,
          headings: headings.map((h) => ({
            level: h.level,
            text: h.text,
            line: h.line,
          })),
          hint: "Call this tool again with `section` set to one of the headings above to retrieve its content.",
        };
      }

      // Section retrieval mode
      const result = sliceSection(wordMarkdown, headings, section);
      if (!result.found) {
        return {
          mode: "section" as const,
          found: false,
          query: section,
          availableHeadings: headings.map((h) => h.text),
          hint: "No heading matched. Use one of the exact heading texts from availableHeadings.",
        };
      }

      const truncated = result.content.length > MAX_SECTION_CHARS;
      return {
        mode: "section" as const,
        found: true,
        query: section,
        heading: result.heading,
        truncated,
        content: truncated
          ? result.content.slice(0, MAX_SECTION_CHARS) + "\n\n... [truncated at 8000 chars]"
          : result.content,
      };
    },
  });
}
