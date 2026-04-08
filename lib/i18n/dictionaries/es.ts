export interface Dictionary {
  brand: { name: string; tagline: string };
  common: {
    continue: string;
    back: string;
    cancel: string;
    submit: string;
    optional: string;
    required: string;
    loading: string;
    language: string;
    theme: string;
  };
  landing: {
    eyebrow: string;
    title: string;
    subtitle: string;
    modeNewTitle: string;
    modeNewDescription: string;
    modeNewCta: string;
    modeUpdateTitle: string;
    modeUpdateDescription: string;
    modeUpdateCta: string;
    featuresTitle: string;
    features: { title: string; description: string }[];
  };
  new: {
    title: string;
    subtitle: string;
    block1: string;
    block2: string;
    block3: string;
    block4: string;
    fields: {
      clientName: string;
      description: string;
      descriptionHelp: string;
      bcVersion: string;
      projectType: string;
      projectTypeExtension: string;
      projectTypeCustom: string;
      repoUrl: string;
      modules: string;
      modulesSales: string;
      modulesPurchases: string;
      modulesWarehouse: string;
      modulesProduction: string;
      modulesFinance: string;
      modulesProjects: string;
      modulesHR: string;
      modulesCustom: string;
      businessFlow: string;
      businessFlowHelp: string;
      integrations: string;
      integrationsHelp: string;
      tables: string;
      tablesHelp: string;
      codeunits: string;
      codeunitsHelp: string;
      setupPages: string;
      setupPagesHelp: string;
      jobQueue: string;
      readerLevel: string;
      readerKey: string;
      readerIT: string;
      readerDirector: string;
      excludedFeatures: string;
      excludedFeaturesHelp: string;
      terminology: string;
      terminologyHelp: string;
      outputLanguage: string;
      outputLanguageEs: string;
      outputLanguageEn: string;
      wikiPageName: string;
      wikiPageNameHelp: string;
      wikiPageNamePlaceholder: string;
    };
  };
  update: {
    title: string;
    subtitle: string;
    repoUrl: string;
    wordUpload: string;
    wordUploadPlaceholder: string;
    wordUploadHint: string;
    newFeatures: string;
    newFeaturesHelp: string;
    removedFeatures: string;
    wikiPageName: string;
    wikiPageNameHelp: string;
    wikiPageNamePlaceholder: string;
  };
  progress: {
    title: string;
    subtitle: string;
    status: { queued: string; running: string; done: string; error: string };
    logsTitle: string;
    elapsed: string;
    eventTypes: {
      phase: string;
      action: string;
      section: string;
      done: string;
      error: string;
      text_chunk: string;
    };
  };
  result: {
    title: string;
    subtitle: string;
    wikiLink: string;
    preview: string;
    newDocument: string;
  };
  select: {
    eyebrow: string;
    title: string;
    subtitle: string;
    selectAll: string;
    deselectAll: string;
    selectedCount: string;
    continueCta: string;
    notAwaiting: string;
  };
}

export const es: Dictionary = {
  brand: {
    name: "Scout DEV",
    tagline: "Documentación funcional con IA · by Orisha Agrifood",
  },
  common: {
    continue: "Continuar",
    back: "Volver",
    cancel: "Cancelar",
    submit: "Generar documentación",
    optional: "Opcional",
    required: "Requerido",
    loading: "Cargando…",
    language: "Idioma",
    theme: "Tema",
  },
  landing: {
    eyebrow: "Scout DEV · IA generativa Orisha Agrifood",
    title: "De repositorio AL a Wiki publicada, sin esfuerzo",
    subtitle:
      "Scout DEV analiza tu proyecto de Business Central en Gitea y publica documentación funcional orientada al cliente en minutos.",
    modeNewTitle: "Proyecto nuevo",
    modeNewDescription:
      "Genera documentación desde cero analizando el repositorio y un formulario de contexto funcional.",
    modeNewCta: "Empezar desde cero",
    modeUpdateTitle: "Actualizar documentación",
    modeUpdateDescription:
      "Parte de un Word existente y detecta automáticamente lo que falta o ha cambiado en el repositorio.",
    modeUpdateCta: "Subir Word existente",
    featuresTitle: "Cómo trabaja Scout DEV",
    features: [
      {
        title: "Exploración incremental",
        description:
          "Scout DEV recorre el repositorio como un desarrollador: grep, lectura selectiva y análisis dirigido.",
      },
      {
        title: "Contexto del cliente",
        description:
          "La documentación se adapta al nivel técnico del lector y a la terminología específica del cliente.",
      },
      {
        title: "Publicación automática",
        description:
          "El resultado se sube a la Wiki del mismo repositorio de Gitea listo para compartir.",
      },
    ],
  },
  new: {
    title: "Nuevo proyecto de documentación",
    subtitle:
      "Rellena los siguientes bloques para dar contexto funcional al agente. Cuanto más detalle proporciones, mejor será el resultado.",
    block1: "1 · Identidad del proyecto",
    block2: "2 · Módulos funcionales",
    block3: "3 · Objetos clave",
    block4: "4 · Contexto para el cliente",
    fields: {
      clientName: "Nombre del cliente / proyecto",
      description: "Descripción general",
      descriptionHelp: "¿Qué problema resuelve esta extensión?",
      bcVersion: "Versión de Business Central",
      projectType: "Tipo de desarrollo",
      projectTypeExtension: "Extensión de módulo estándar",
      projectTypeCustom: "Desarrollo desde cero",
      repoUrl: "URL del repositorio en Gitea",
      modules: "Áreas que cubre",
      modulesSales: "Ventas",
      modulesPurchases: "Compras",
      modulesWarehouse: "Almacén",
      modulesProduction: "Producción",
      modulesFinance: "Finanzas",
      modulesProjects: "Proyectos",
      modulesHR: "RRHH",
      modulesCustom: "Custom",
      businessFlow: "Flujo principal del negocio",
      businessFlowHelp:
        'Ej: "El proceso arranca con un pedido de venta y termina con la expedición."',
      integrations: "Integraciones externas",
      integrationsHelp: "APIs, EDI, portales web, otros sistemas…",
      tables: "Tablas principales",
      tablesHelp: "Nombre, número y propósito de cada tabla relevante.",
      codeunits: "Codeunits de lógica central",
      codeunitsHelp: "Nombre, número, qué gestiona.",
      setupPages: "Páginas de setup / configuración",
      setupPagesHelp: "Ruta en el menú y qué debe configurar el cliente.",
      jobQueue: "¿Hay procesos batch o Job Queue?",
      readerLevel: "Nivel técnico del lector",
      readerKey: "Usuario clave",
      readerIT: "IT interno",
      readerDirector: "Dirección",
      excludedFeatures: "Funcionalidades que NO documentar",
      excludedFeaturesHelp: "Workarounds, lógica temporal, partes obsoletas.",
      terminology: "Terminología específica del cliente",
      terminologyHelp:
        'Ej: "Ellos llaman \'expedición\' a lo que en BC es Posted Shipment."',
      outputLanguage: "Idioma del documento",
      outputLanguageEs: "Español",
      outputLanguageEn: "Inglés",
      wikiPageName: "Nombre de la página Wiki",
      wikiPageNameHelp:
        "Nombre que tendrá la página en la Wiki del repositorio. Si ya existe, se actualizará.",
      wikiPageNamePlaceholder: "Documentacion-Funcional",
    },
  },
  update: {
    title: "Actualizar documentación existente",
    subtitle:
      "Sube el Word con la documentación previa e indica el repositorio. El agente fusionará ambas fuentes y marcará lo nuevo.",
    repoUrl: "URL del repositorio en Gitea",
    wordUpload: "Documento Word (.docx)",
    wordUploadPlaceholder:
      "Arrastra el archivo aquí o haz clic para seleccionar",
    wordUploadHint: "Tamaño máximo recomendado: 20MB",
    newFeatures: "Funcionalidades añadidas tras el Word",
    newFeaturesHelp:
      "Describe brevemente qué ha cambiado o se ha añadido desde la última versión del Word.",
    removedFeatures: "Algo que ya no existe o ha cambiado significativamente",
    wikiPageName: "Nombre de la página Wiki",
    wikiPageNameHelp:
      "Nombre que tendrá la página en la Wiki del repositorio. Si ya existe, se actualizará.",
    wikiPageNamePlaceholder: "Documentacion-Funcional",
  },
  progress: {
    title: "Generando documentación",
    subtitle: "El agente está analizando tu repositorio en tiempo real",
    status: {
      queued: "En cola",
      running: "En proceso",
      done: "Completado",
      error: "Error",
    },
    logsTitle: "Actividad del agente",
    elapsed: "Tiempo transcurrido",
    eventTypes: {
      phase: "Fase",
      action: "Acción",
      section: "Sección",
      done: "Finalizado",
      error: "Error",
      text_chunk: "Escribiendo",
    },
  },
  result: {
    title: "Documentación publicada",
    subtitle: "La documentación se ha publicado correctamente en la Wiki del repositorio.",
    wikiLink: "Ver en la Wiki de Gitea",
    preview: "Previsualización del contenido",
    newDocument: "Generar otra documentación",
  },
  select: {
    eyebrow: "Workspace multi-proyecto detectado",
    title: "Elige los proyectos a documentar",
    subtitle:
      "Hemos detectado {count} proyectos AL en este repositorio. Selecciona cuáles quieres que Scout DEV documente en esta ejecución.",
    selectAll: "Seleccionar todos",
    deselectAll: "Deseleccionar todos",
    selectedCount: "{n} seleccionado(s)",
    continueCta: "Continuar con la generación",
    notAwaiting: "Este job ya no está a la espera de selección.",
  },
};
