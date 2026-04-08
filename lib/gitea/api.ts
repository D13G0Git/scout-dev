/**
 * Gitea REST API v1 client.
 * Used for metadata retrieval and Wiki page publishing.
 * The agent reads files from a local clone — not via the REST API.
 */

export interface GiteaRepoMeta {
  owner: string;
  name: string;
  defaultBranch: string;
  description: string;
  fullName: string;
}

function getBaseUrl(): string {
  return (process.env.GITEA_URL || "").replace(/\/+$/, "");
}

function getToken(): string {
  return process.env.GITEA_TOKEN || "";
}

function headers(): HeadersInit {
  return {
    Authorization: `token ${getToken()}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/**
 * Parses a Gitea repo URL into owner and name.
 * Supports: https://git.tipsa.cloud:3000/orisha/EDH(.git)
 */
export function parseRepoUrl(repoUrl: string): { owner: string; name: string } {
  try {
    const url = new URL(repoUrl);
    const parts = url.pathname.replace(/^\/+|\/+$/g, "").replace(/\.git$/, "").split("/");
    if (parts.length < 2) {
      throw new Error(`Cannot parse owner/name from URL path: ${url.pathname}`);
    }
    return { owner: parts[0], name: parts[1] };
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("Cannot parse")) throw e;
    throw new Error(`Invalid repo URL: ${repoUrl}`);
  }
}

export async function getRepoMeta(repoUrl: string): Promise<GiteaRepoMeta> {
  const { owner, name } = parseRepoUrl(repoUrl);
  const res = await fetch(`${getBaseUrl()}/api/v1/repos/${owner}/${name}`, {
    headers: headers(),
  });
  if (!res.ok) {
    throw new Error(`Gitea getRepoMeta failed: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return {
    owner,
    name,
    defaultBranch: data.default_branch ?? "main",
    description: data.description ?? "",
    fullName: data.full_name ?? `${owner}/${name}`,
  };
}

/**
 * Creates or updates a Wiki page in the repository.
 * Returns the URL to the published page.
 */
export async function upsertWikiPage(
  repoUrl: string,
  title: string,
  content: string,
): Promise<{ url: string }> {
  const { owner, name } = parseRepoUrl(repoUrl);
  const base = getBaseUrl();
  const apiBase = `${base}/api/v1/repos/${owner}/${name}/wiki`;
  const pageName = title.replace(/\s+/g, "-");

  // Check if page already exists
  const checkRes = await fetch(`${apiBase}/page/${encodeURIComponent(pageName)}`, {
    headers: headers(),
  });

  if (checkRes.ok) {
    // Update existing page
    const patchRes = await fetch(`${apiBase}/page/${encodeURIComponent(pageName)}`, {
      method: "PATCH",
      headers: headers(),
      body: JSON.stringify({
        title: pageName,
        content_base64: Buffer.from(content, "utf-8").toString("base64"),
        message: `Update ${title} via Scout DEV`,
      }),
    });
    if (!patchRes.ok) {
      throw new Error(`Gitea wiki PATCH failed: ${patchRes.status} ${await patchRes.text()}`);
    }
  } else {
    // Create new page
    const postRes = await fetch(`${apiBase}/new`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        title: pageName,
        content_base64: Buffer.from(content, "utf-8").toString("base64"),
        message: `Create ${title} via Scout DEV`,
      }),
    });
    if (!postRes.ok) {
      throw new Error(`Gitea wiki POST failed: ${postRes.status} ${await postRes.text()}`);
    }
  }

  const pageUrl = `${base}/${owner}/${name}/wiki/${encodeURIComponent(pageName)}`;
  return { url: pageUrl };
}

// These stubs remain for potential future use (not needed when agent reads from local clone)
export async function listTree(
  _owner: string,
  _name: string,
  _sha: string,
): Promise<string[]> {
  throw new Error("listTree: not implemented (agent uses local clone)");
}

export async function getRawFile(
  _owner: string,
  _name: string,
  _path: string,
): Promise<string> {
  throw new Error("getRawFile: not implemented (agent uses local clone)");
}
