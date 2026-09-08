/**
 * Tenant resolution.
 *
 * Kept separate from `src/middleware.ts` so the rules that decide *which tenant
 * a request belongs to* can be unit tested without standing up a server. These
 * are the only functions that turn untrusted request data into a tenant slug,
 * so they are worth testing directly.
 */

/** Hosts that are always development, regardless of configuration. */
export function isLocalHost(hostname: string | null | undefined): boolean {
  const host = normalizeHost(hostname);
  if (!host) return false;
  return (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host === '127.0.0.1' ||
    host === '[::1]'
  );
}

/** Cloudflare Pages preview/production hosts for the project itself. */
export function isPagesDevHost(hostname: string | null | undefined): boolean {
  const host = normalizeHost(hostname);
  return Boolean(host && host.endsWith('.pages.dev'));
}

/**
 * Lowercase the host and strip the port and any trailing dot.
 * The Host header is client-supplied, so nothing here may assume a shape.
 */
export function normalizeHost(hostname: string | null | undefined): string {
  if (!hostname) return '';
  // Strip the port. IPv6 literals arrive bracketed, e.g. "[::1]:4321".
  const withoutPort = hostname.startsWith('[')
    ? hostname.slice(0, hostname.indexOf(']') + 1)
    : hostname.split(':')[0];
  return withoutPort.trim().toLowerCase().replace(/\.$/, '');
}

/**
 * Whether the `?as=<slug>` tenant override may be honored for this request.
 *
 * Three tiers, deliberately failing closed:
 *
 *  - `localhost` always allows it; it is not reachable from outside the
 *    developer's machine.
 *  - `*.pages.dev` allows it only when ALLOW_TENANT_OVERRIDE=true is set.
 *    A Cloudflare Pages project is always served at `<project>.pages.dev`
 *    alongside any custom domain, so treating preview hosts as implicitly
 *    safe would expose a private tenant at `<project>.pages.dev/?as=<slug>`
 *    even when the custom domain sits behind Cloudflare Access.
 *  - A custom domain NEVER allows it, whatever the setting says. Tenants there
 *    are resolved from the hostname alone. This is what makes enabling the flag
 *    for a demo or preview deployment unable to open a cross-tenant read in
 *    production, even if the same project serves both.
 */
export function isOverrideAllowed(
  hostname: string | null | undefined,
  allowOverrideSetting: string | boolean | undefined
): boolean {
  if (isLocalHost(hostname)) return true;
  if (!isPagesDevHost(hostname)) return false;
  return allowOverrideSetting === true || allowOverrideSetting === 'true';
}

/**
 * Map a request hostname to a tenant slug.
 *
 * When `baseDomain` is set (SITE_BASE_DOMAIN), the slug is the label directly
 * beneath it, which is exact for any domain including multi-label public
 * suffixes such as `example.co.uk`.
 *
 * Without it, a heuristic applies: three or more labels means the first label
 * is the tenant. That is correct for `acme.example.com` but cannot distinguish
 * an apex on a multi-label suffix (`example.co.uk`) from a subdomain, which is
 * why setting SITE_BASE_DOMAIN is recommended in production.
 *
 * Returns undefined for the apex, for `www`, for localhost and for
 * `*.pages.dev` — all of which are served by the landing page instead.
 */
export function hostnameToSlug(
  hostname: string | null | undefined,
  baseDomain?: string | null
): string | undefined {
  const host = normalizeHost(hostname);
  if (!host) return undefined;
  if (isLocalHost(host)) return undefined;
  if (isPagesDevHost(host)) return undefined;

  const base = normalizeHost(baseDomain);
  if (base) {
    if (host === base || host === `www.${base}`) return undefined;
    if (!host.endsWith(`.${base}`)) return undefined;
    const labels = host.slice(0, -(base.length + 1)).split('.');
    // www.acme.example.com -> acme
    const slug = labels[0] === 'www' ? labels[1] : labels[0];
    return slug || undefined;
  }

  const labels = host.split('.');
  // Strip a leading www so www.example.com resolves to the landing page rather
  // than to a tenant literally named "www".
  const withoutWww = labels[0] === 'www' ? labels.slice(1) : labels;
  if (withoutWww.length >= 3) return withoutWww[0];
  return undefined;
}
