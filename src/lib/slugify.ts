/**
 * Shared filename-safe slug helper. Used by every client-side export
 * (Phase 4's full-kit .txt download, Phase 5's per-asset downloads) so
 * filenames stay consistent across the app.
 */
export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "project"
  );
}
