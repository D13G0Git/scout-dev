export type JobMode = "new" | "update";

export type JobStatus =
  | "queued"
  | "awaiting_selection"
  | "running"
  | "done"
  | "error";

export interface ProjectSelection {
  path: string;
  dir: string;
  name: string;
  publisher: string;
  version: string;
  description?: string;
}

export type JobEventType = "phase" | "action" | "section" | "done" | "error" | "text_chunk";

export interface JobEvent {
  type: JobEventType;
  message: string;
  timestamp: number;
  progress?: number;
  url?: string;
}

export interface Job {
  id: string;
  mode: JobMode;
  status: JobStatus;
  createdAt: number;
  repoUrl: string;
  clientName?: string;
  outputLanguage?: "es" | "en";
  events: JobEvent[];
  resultUrl?: string;
  /** Final markdown produced by the real agent (Phase 2a) */
  result?: string;
  /** Free-form form payload stored for the agent prompt */
  formData?: Record<string, unknown>;
  /** Available projects detected in the workspace (multi-project case) */
  availableProjects?: ProjectSelection[];
  /** Project paths the user chose to document (multi-project case) */
  selectedProjects?: string[];
  /** Modo Update: markdown extracted from the uploaded .docx */
  wordMarkdown?: string;
  /** Modo Update: headings parsed from the Word for the TOC tool */
  wordHeadings?: { level: number; text: string; line: number }[];
  /** Modo Update: original filename of the uploaded .docx */
  wordFilename?: string;
  /** Absolute path where the repo was cloned (or TEST_REPO_PATH for dev) */
  repoLocalPath?: string;
  /** User-specified Wiki page name. Defaults to "Documentacion-Funcional" */
  wikiPageName?: string;
}

export interface CreateJobPayload {
  mode: JobMode;
  repoUrl: string;
  clientName?: string;
  outputLanguage?: "es" | "en";
  // Additional form fields are accepted but not strictly typed in the mockup
  [key: string]: unknown;
}
