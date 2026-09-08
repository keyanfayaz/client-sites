import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * Content collection ids keep their file extension. Strip it so ids can be
 * compared against request paths.
 */
export function stripExt(id: string): string {
  return id.replace(/\.(md|mdx)$/, '');
}

/**
 * Every page a tenant is allowed to serve.
 *
 * `published: false` is filtered here, at the point pages are loaded, rather
 * than only where navigation is built. An unpublished page is therefore
 * genuinely unreachable: it is absent from the nav and the renderer cannot
 * find it, so requesting its URL directly returns a 404 like any other
 * unknown path.
 */
export async function getClientPages(
  clientSlug: string
): Promise<CollectionEntry<'clientPages'>[]> {
  return getCollection(
    'clientPages',
    (entry) =>
      entry.id.startsWith(`${clientSlug}/`) && entry.data.published !== false
  );
}
