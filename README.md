# BC Doc Generator

Herramienta web que analiza repositorios de **Business Central (AL)** alojados
en **Gitea** y genera documentación funcional orientada al cliente, publicándola
automáticamente en la Wiki del mismo repositorio.

## Estado actual: Fase 1 — Mockup visual navegable

Este commit contiene un esqueleto **Next.js 16 / React 19 fullstack** con UI
definitiva, ambos modos (Nuevo / Actualizar) y **streaming SSE real** de
eventos simulados. Toda la integración con Gitea, el parser de Word y el
agente de Claude están presentes como _stubs_ con tipos, listos para
implementarse en Fase 2.

### Lo que funciona

- Landing bilingüe (ES / EN) con selector de idioma y toggle de tema
- Formulario Modo Nuevo (5 bloques: identidad, módulos, objetos clave, contexto cliente)
- Formulario Modo Actualizar con dropzone de `.docx` (`react-dropzone`)
- API `POST /api/jobs` crea un job en memoria
- API `GET /api/jobs/:id/stream` emite eventos SSE con delays realistas
- Vista `/progress/:id` consume el stream y muestra feed + barra de progreso
- Vista `/result/:id` con preview Markdown (`react-markdown` + `remark-gfm`)

### Lo que NO funciona (Fase 2)

- No se llama a ningún LLM
- No se clona ningún repo real
- No se lee el `.docx` (se valida el upload y se descarta)
- No se publica nada en la Wiki de Gitea

## Stack

- **Next.js 16** App Router, un único proceso (sin Express separado)
- **React 19** + **TypeScript**
- **Tailwind v4** + plugin `@tailwindcss/typography`
- Primitivas estilo **shadcn/ui** (Radix UI debajo)
- **lucide-react** para iconos
- **react-dropzone** para upload del Word
- **Vercel AI SDK** + `@openrouter/ai-sdk-provider` (instalados, no usados aún)

## Comandos

```bash
npm install          # ya ejecutado durante el scaffold
npm run dev          # http://localhost:3000
npm run build        # build de producción
npm run start        # servir el build
```

## Estructura

```
app/
  layout.tsx                      # Providers + site header + footer
  page.tsx                        # Landing + mode selector
  new/page.tsx                    # Formulario Modo Nuevo
  update/page.tsx                 # Formulario Modo Actualizar
  progress/[jobId]/page.tsx       # Feed SSE de progreso
  result/[jobId]/page.tsx         # Vista de resultado con Markdown
  api/
    jobs/route.ts                 # POST crear job
    jobs/[jobId]/route.ts         # GET job meta
    jobs/[jobId]/stream/route.ts  # GET SSE con eventos mock
    upload/route.ts               # POST upload Word (stub)

components/
  ui/                             # Primitivas estilo shadcn
  forms/                          # Formularios Modo Nuevo / Actualizar
  progress/progress-stream.tsx    # Cliente SSE + render de eventos
  result-view.tsx                 # Vista de resultado
  site-header.tsx                 # Header con selector de idioma + tema

lib/
  i18n/                           # Provider + diccionarios ES / EN
  jobs/                           # Store en memoria + tipos
  sse/                            # Mock events + helper de encoding
  ai/openrouter.ts                # STUB — Phase 2
  agent/                          # STUB — tipos de tools + orquestador
  gitea/                          # STUB — cliente REST + clone
  parsers/                        # STUB — word + app.json
  utils.ts                        # cn, sleep, id helpers
```

## Variables de entorno

Copia `.env.local.example` a `.env.local`. En Fase 1 (mockup) **no son
requeridas** — todo funciona sin ellas.

## Roadmap

- **Fase 1** ✅ Mockup visual navegable con SSE simulado
- **Fase 2** Agente real con Vercel AI SDK + OpenRouter, clonado real con
  `simple-git`, parser de Word con `mammoth`, publicación real en Wiki
- **Fase 3** Historial de jobs persistente, auth básica, despliegue Hostinger + PM2
