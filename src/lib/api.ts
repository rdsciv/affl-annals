/**
 * Helper to resolve public assets and marts paths respecting GitHub Pages basePath.
 */
export function getAssetUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

export async function fetchMartJson<T = any>(filename: string): Promise<T> {
  const url = getAssetUrl(`/data/marts/${filename}`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch mart: ${url} (HTTP ${res.status})`);
  }
  return res.json();
}
