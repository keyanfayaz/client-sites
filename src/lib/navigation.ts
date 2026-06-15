import type { CollectionEntry } from 'astro:content';

/**
 * Centralized navigation computation function
 * Builds navigation from content entries, excluding the home page
 */
export function buildNavigation(
  entries: CollectionEntry<'clientPages'>[],
  clientSlug: string
): Array<{ label: string; path: string }> {
  function stripExt(id: string): string {
    return id.replace(/\.(md|mdx)$/, '');
  }

  return entries
    .filter((e) => e.data.published !== false)
    .sort((a, b) => (a.data.navOrder ?? 9999) - (b.data.navOrder ?? 9999))
    .map((e) => {
      const pathWithoutClient = stripExt(e.id).replace(`${clientSlug}/`, '');
      // Handle index files - they should map to '/' not '/index'
      const cleanPath = pathWithoutClient === 'index' ? '/' : `/${pathWithoutClient}`;
      return {
        label: e.data.title,
        path: cleanPath
      };
    })
    .filter((item) => item.path !== '/'); // Exclude home page from navigation
}
