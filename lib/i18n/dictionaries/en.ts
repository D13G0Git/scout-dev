import type { Dictionary } from "./es";

export const en: Dictionary = {
  brand: {
    name: "Scout DEV",
    tagline: "AI-powered functional documentation · by Orisha Agrifood",
  },
  common: {
    continue: "Continue",
    back: "Back",
    cancel: "Cancel",
    submit: "Generate documentation",
    optional: "Optional",
    required: "Required",
    loading: "Loading…",
    language: "Language",
    theme: "Theme",
  },
  landing: {
    eyebrow: "Scout DEV · Orisha Agrifood generative AI",
    title: "From AL repo to published Wiki, effortlessly",
    subtitle:
      "Scout DEV analyzes your Business Central project on Gitea and publishes client-facing functional documentation in minutes.",
    modeNewTitle: "New project",
    modeNewDescription:
      "Generate documentation from scratch by analyzing the repository and a contextual form.",
    modeNewCta: "Start from scratch",
    modeUpdateTitle: "Update documentation",
    modeUpdateDescription:
      "Start from an existing Word and automatically detect what's missing or has changed.",
    modeUpdateCta: "Upload existing Word",
    featuresTitle: "How Scout DEV works",
    features: [
      {
        title: "Incremental exploration",
        description:
          "Scout DEV explores the repo like a developer: grep, selective reads, and directed analysis.",
      },
      {
        title: "Client context",
        description:
          "Documentation adapts to the reader's technical level and the client's specific terminology.",
      },
      {
        title: "Automatic publishing",
        description:
          "The result is pushed to the Wiki of the same Gitea repository, ready to share.",
      },
    ],
  },
  new: {
    title: "New documentation project",
    subtitle:
      "Fill in the blocks below to give the agent functional context. The more detail, the better the output.",
    block1: "1 · Project identity",
    block2: "2 · Functional modules",
    block3: "3 · Key objects",
    block4: "4 · Client context",
    fields: {
      clientName: "Client / project name",
      description: "General description",
      descriptionHelp: "What problem does this extension solve?",
      bcVersion: "Business Central version",
      projectType: "Development type",
      projectTypeExtension: "Extension of a standard module",
      projectTypeCustom: "Custom development from scratch",
      repoUrl: "Gitea repository URL",
      modules: "Covered areas",
      modulesSales: "Sales",
      modulesPurchases: "Purchases",
      modulesWarehouse: "Warehouse",
      modulesProduction: "Production",
      modulesFinance: "Finance",
      modulesProjects: "Projects",
      modulesHR: "HR",
      modulesCustom: "Custom",
      businessFlow: "Main business flow",
      businessFlowHelp:
        'E.g.: "The process starts with a sales order and ends with the shipment."',
      integrations: "External integrations",
      integrationsHelp: "APIs, EDI, web portals, other systems…",
      tables: "Main tables",
      tablesHelp: "Name, number and purpose of each relevant table.",
      codeunits: "Core logic codeunits",
      codeunitsHelp: "Name, number, what it manages.",
      setupPages: "Setup / configuration pages",
      setupPagesHelp: "Menu path and what the client needs to configure.",
      jobQueue: "Are there batch processes or Job Queue entries?",
      readerLevel: "Reader technical level",
      readerKey: "Key user",
      readerIT: "Internal IT",
      readerDirector: "Management",
      excludedFeatures: "Features NOT to document",
      excludedFeaturesHelp: "Workarounds, temporary logic, obsolete parts.",
      terminology: "Client-specific terminology",
      terminologyHelp:
        'E.g.: "They call \'delivery\' what in BC is Posted Shipment."',
      outputLanguage: "Output document language",
      outputLanguageEs: "Spanish",
      outputLanguageEn: "English",
      wikiPageName: "Wiki page name",
      wikiPageNameHelp:
        "Name for the page in the repository Wiki. If it already exists, it will be updated.",
      wikiPageNamePlaceholder: "Documentacion-Funcional",
    },
  },
  update: {
    title: "Update existing documentation",
    subtitle:
      "Upload the Word with previous documentation and point to the repository. The agent will merge both and mark what's new.",
    repoUrl: "Gitea repository URL",
    wordUpload: "Word document (.docx)",
    wordUploadPlaceholder: "Drop the file here or click to browse",
    wordUploadHint: "Recommended max size: 20MB",
    newFeatures: "Features added after the Word",
    newFeaturesHelp:
      "Briefly describe what has changed or been added since the last version.",
    removedFeatures: "Something that no longer exists or has changed significantly",
    wikiPageName: "Wiki page name",
    wikiPageNameHelp:
      "Name for the page in the repository Wiki. If it already exists, it will be updated.",
    wikiPageNamePlaceholder: "Documentacion-Funcional",
  },
  progress: {
    title: "Generating documentation",
    subtitle: "The agent is analyzing your repository in real time",
    status: {
      queued: "Queued",
      running: "Running",
      done: "Completed",
      error: "Error",
    },
    logsTitle: "Agent activity",
    elapsed: "Elapsed time",
    eventTypes: {
      phase: "Phase",
      action: "Action",
      section: "Section",
      done: "Done",
      error: "Error",
      text_chunk: "Writing",
    },
  },
  result: {
    title: "Documentation published",
    subtitle: "The documentation has been successfully published to the repository Wiki.",
    wikiLink: "Open in Gitea Wiki",
    preview: "Content preview",
    newDocument: "Generate another document",
  },
  select: {
    eyebrow: "Multi-project workspace detected",
    title: "Pick the projects to document",
    subtitle:
      "We found {count} AL projects in this repository. Choose which ones Scout DEV should document in this run.",
    selectAll: "Select all",
    deselectAll: "Deselect all",
    selectedCount: "{n} selected",
    continueCta: "Continue to generation",
    notAwaiting: "This job is no longer awaiting selection.",
  },
};
