import type { JobEvent, JobMode } from "@/lib/jobs/types";

type MockStep = Omit<JobEvent, "timestamp"> & { delayMs: number };

const SHARED_END: MockStep[] = [
  {
    type: "section",
    message: "Sección: Descripción general",
    progress: 70,
    delayMs: 2200,
  },
  {
    type: "section",
    message: "Sección: Flujo principal de negocio",
    progress: 80,
    delayMs: 2600,
  },
  {
    type: "section",
    message: "Sección: Módulos funcionales",
    progress: 88,
    delayMs: 2400,
  },
  {
    type: "section",
    message: "Sección: Configuración y setup",
    progress: 94,
    delayMs: 2000,
  },
  {
    type: "phase",
    message: "Publicando en la Wiki del repositorio…",
    progress: 97,
    delayMs: 1400,
  },
  {
    type: "done",
    message: "Documentación publicada correctamente",
    progress: 100,
    url: "https://gitea.example.com/org/bc-ext/wiki/Documentacion-Funcional",
    delayMs: 0,
  },
];

const NEW_STEPS: MockStep[] = [
  {
    type: "phase",
    message: "Clonando repositorio y preparando workspace…",
    progress: 4,
    delayMs: 1200,
  },
  { type: "action", message: "Leyendo app.json", progress: 10, delayMs: 900 },
  {
    type: "action",
    message: "Inventario de objetos AL (247 ficheros encontrados)",
    progress: 16,
    delayMs: 1200,
  },
  {
    type: "phase",
    message: "Analizando contexto funcional del formulario…",
    progress: 22,
    delayMs: 1100,
  },
  {
    type: "action",
    message: "Buscando referencias a Sales Header",
    progress: 28,
    delayMs: 1400,
  },
  {
    type: "action",
    message: "Leyendo codeunit 50200 PriceCalculation",
    progress: 34,
    delayMs: 1600,
  },
  {
    type: "action",
    message: "Leyendo tabla 50210 Shipment Extension",
    progress: 40,
    delayMs: 1300,
  },
  {
    type: "action",
    message: "Buscando páginas de setup (grep 'Setup')",
    progress: 46,
    delayMs: 1500,
  },
  {
    type: "action",
    message: "Leyendo page 50220 Sales Setup Extension",
    progress: 52,
    delayMs: 1400,
  },
  {
    type: "action",
    message: "Detectando procesos en Job Queue",
    progress: 58,
    delayMs: 1200,
  },
  {
    type: "phase",
    message: "Generando secciones del documento…",
    progress: 64,
    delayMs: 1300,
  },
  ...SHARED_END,
];

const UPDATE_STEPS: MockStep[] = [
  {
    type: "phase",
    message: "Extrayendo contenido del Word…",
    progress: 5,
    delayMs: 1200,
  },
  {
    type: "action",
    message: "Parseando estructura de secciones existentes",
    progress: 10,
    delayMs: 1000,
  },
  {
    type: "phase",
    message: "Clonando repositorio de Gitea…",
    progress: 16,
    delayMs: 1400,
  },
  { type: "action", message: "Leyendo app.json", progress: 22, delayMs: 900 },
  {
    type: "action",
    message: "Comparando objetos AL con el Word (delta analysis)",
    progress: 30,
    delayMs: 1600,
  },
  {
    type: "action",
    message: "Detectados 4 codeunits nuevos no documentados",
    progress: 38,
    delayMs: 1500,
  },
  {
    type: "action",
    message: "Leyendo codeunit 50305 EDI Integration",
    progress: 46,
    delayMs: 1500,
  },
  {
    type: "action",
    message: "Leyendo tabla 50310 EDI Log",
    progress: 54,
    delayMs: 1300,
  },
  {
    type: "phase",
    message: "Fusionando contenido previo con delta detectado…",
    progress: 62,
    delayMs: 1500,
  },
  ...SHARED_END,
];

export function getMockEvents(mode: JobMode): MockStep[] {
  return mode === "update" ? UPDATE_STEPS : NEW_STEPS;
}
