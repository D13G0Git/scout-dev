// Contracts for the agent tools. Implementations live in `tools.ts` (Phase 2).

export interface ListFilesInput {
  path: string;
  extension?: string;
}

export interface ReadFileInput {
  path: string;
}

export interface GrepInput {
  pattern: string;
  path?: string;
  caseInsensitive?: boolean;
  maxResults?: number;
}

export interface GrepMatch {
  file: string;
  line: number;
  snippet: string;
}

export interface ReadAppJsonInput {
  path?: string;
}

export interface AppJson {
  id: string;
  name: string;
  publisher: string;
  version: string;
  dependencies?: Array<{ id: string; name: string; version: string }>;
}

export interface WriteWikiPageInput {
  title: string;
  content: string;
}
