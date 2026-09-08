import type { CollectionEntry } from 'astro:content';
import { stripExt } from './clientPages';

/**
 * Centralized navigation computation function
 * Builds navigation from content entries, excluding the home page
 */
export function buildNavigation(
  entries: CollectionEntry<'clientPages'>[],
  clientSlug: string
): Array<{ label: string; path: string }> {
  return (
    entries
      // Unpublished pages are already excluded by getClientPages, which is what
      // makes them unreachable rather than merely unlinked. Repeated here so this
      // function is still correct if it is ever handed an unfiltered collection.
      .filter((e) => e.data.published !== false)
      .sort((a, b) => (a.data.navOrder ?? 9999) - (b.data.navOrder ?? 9999))
      .map((e) => {
        // Anchored to the start so a nested path repeating the slug is not mangled.
        const pathWithoutClient = stripExt(e.id).replace(
          new RegExp(`^${clientSlug}/`),
          ''
        );
        // Handle index files - they should map to '/' not '/index'
        const cleanPath =
          pathWithoutClient === 'index' ? '/' : `/${pathWithoutClient}`;
        return {
          label: e.data.title,
          path: cleanPath
        };
      })
      .filter((item) => item.path !== '/')
  ); // Exclude home page from navigation
}
