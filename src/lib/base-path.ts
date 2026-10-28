/**
 * Public files are served under the GitHub Pages project path.
 * next.config.ts sets NEXT_PUBLIC_BASE_PATH to the same basePath.
 */
export function assetPath(path: string): string {
  if (!path) return path;
  if (/^(?:https?:)?\/\//.test(path) || path.startsWith('data:')) return path;
  const base = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}
