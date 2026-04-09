# Scout DEV

Herramienta web que analiza repositorios de **Business Central (AL)** alojados
en **Gitea** y genera documentación funcional orientada al cliente final,
publicándola automáticamente en la Wiki del mismo repositorio.

Un agente IA explora el código AL de forma incremental (lee manifiestos,
lista ficheros, busca patrones, abre solo lo relevante) y redacta un documento
Markdown estructurado siguiendo una metodología de consultoría funcional.

## Funcionalidades

- **Modo Nuevo** — Genera documentación desde cero a partir del código y un
  formulario de contexto (cliente, flujo de negocio, módulos, terminología).
- **Modo Actualizar** — Sube un `.docx` con documentación previa, el agente
  lo compara con el estado actual del código y produce una versión fusionada
  marcando cambios (nuevo, actualizado, eliminado).
- **Workspace multi-proyecto** — Detecta automáticamente repositorios con
  varios `app.json` y permite seleccionar qué proyectos documentar.
- **Publicación en Wiki** — El documento generado se publica directamente en
  la Wiki del repositorio Gitea.
- **Streaming en tiempo real** — El progreso del agente (ficheros leídos,
  búsquedas, fases) se muestra al usuario via SSE.
- **Autenticación** — NextAuth v5 con Credentials provider y JWT.
- **Bilingue** — Interfaz en Español e Inglés con persistencia en localStorage.
- **Tema claro/oscuro** — Toggle con persistencia.

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router, `output: standalone`) |
| UI | React 19, Tailwind v4, Radix UI, lucide-react |
| Formularios | react-hook-form + zod |
| IA | Vercel AI SDK v6 + OpenRouter (`@openrouter/ai-sdk-provider`) |
| Parser Word | mammoth + turndown + turndown-plugin-gfm |
| Git | simple-git (clone con auth token) |
| Auth | NextAuth v5 (Credentials, JWT) |
| Markdown | react-markdown + remark-gfm |
| Deploy | Docker (multi-stage, Node 20 Alpine) |

## Comandos

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # build de produccion
npm run start        # servir el build
```

## Variables de entorno

Crea un fichero `.env.local` con las siguientes variables:

```env
# --- IA (obligatorio para agente real) ---
OPENROUTER_API_KEY=sk-or-...
MODEL=nvidia/nemotron-3-super-120b-a12b  # opcional, default: nvidia/nemotron-3-super-120b-a12b

# --- Gitea (obligatorio para clone + wiki) ---
GITEA_URL=https://git.example.com:3000
GITEA_TOKEN=tu-token-personal

# --- Auth ---
AUTH_SECRET=un-secreto-aleatorio-largo
AUTH_USERS=[{"email":"admin@example.com","password":"secret","name":"Admin"}]

# --- Opcionales ---
TEST_REPO_PATH=C:/repos/mi-proyecto-al  # dev: salta el clone, usa repo local
GIT_SSL_NO_VERIFY=true                  # para certificados autofirmados
TEMP_CLONE_DIR=/app/.tmp/repos          # directorio temporal de clones
```

Sin `OPENROUTER_API_KEY` la app funciona en modo demo con eventos simulados.

## Estructura del proyecto

```
app/
  page.tsx                          # Landing + selector de modo
  login/page.tsx                    # Login (NextAuth)
  new/page.tsx                      # Formulario Modo Nuevo
  update/page.tsx                   # Formulario Modo Actualizar
  select/[jobId]/page.tsx           # Selector de proyectos (workspace)
  progress/[jobId]/page.tsx         # Feed SSE de progreso en tiempo real
  result/[jobId]/page.tsx           # Vista del Markdown generado
  api/
    auth/[...nextauth]/route.ts     # NextAuth handler
    jobs/route.ts                   # POST crear job (+ upload .docx)
    jobs/[jobId]/route.ts           # GET metadata del job
    jobs/[jobId]/stream/route.ts    # GET SSE streaming del agente
    jobs/[jobId]/select/route.ts    # POST seleccion de proyectos

lib/
  ai/openrouter.ts                  # Cliente OpenRouter
  agent/
    run.ts                          # Orquestador del agente (streamText)
    tools.ts                        # Herramientas: list_files, read_file, grep, read_app_json
    prompts.ts                      # System + user prompts (Nuevo / Actualizar)
    workspace.ts                    # Descubrimiento de proyectos AL
    read-previous-doc.ts            # Herramienta de consulta del Word previo
  auth.ts                           # Config NextAuth v5
  gitea/
    clone.ts                        # Clone con simple-git + token auth
    api.ts                          # API REST Gitea v1 (metadata + wiki)
  parsers/word.ts                   # .docx a Markdown (mammoth + turndown)
  jobs/
    store.ts                        # Store de jobs en memoria
    types.ts                        # Tipos Job, JobEvent, JobMode, JobStatus
  i18n/                             # Provider + diccionarios ES / EN
  sse/                              # Encoder SSE + eventos mock (modo demo)

middleware.ts                       # Proteccion de rutas (NextAuth)
Dockerfile                          # Multi-stage build (Node 20 Alpine)
docker-compose.yml                  # Servicio + volumen para clones
```

## Deploy con Docker

```bash
docker compose up --build -d
```

El `Dockerfile` genera un build standalone optimizado. Incluye `git` en la
imagen para que `simple-git` pueda clonar repositorios. El volumen
`clone-tmp` persiste los repos temporales entre reinicios.

Para despliegues en plataformas como Dokploy, configura las variables de
entorno en el panel y apunta al repositorio. Si tu instancia Gitea usa
certificados autofirmados, anade `GIT_SSL_NO_VERIFY=true`.

## Roadmap

- **Fase 1** -- Mockup visual navegable con SSE simulado
- **Fase 2** -- Agente real con Vercel AI SDK, clone, parser Word, wiki
- **Fase 3** -- Auth, Docker, deploy en Hostinger/Dokploy
- **Fase 4** -- Historial de jobs persistente (Redis/DB), mejoras de UX
