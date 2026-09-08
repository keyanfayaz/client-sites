import type { MiddlewareHandler } from 'astro';
import { clients } from './lib/clients';
import {
  hostnameToSlug,
  isOverrideAllowed,
  isPagesDevHost
} from './lib/tenant';

/**
 * Read a setting from the Cloudflare runtime environment, falling back to the
 * build-time environment. Values set in the Pages dashboard only exist on
 * `locals.runtime.env` at request time; values from a local `.env` only exist
 * on `import.meta.env` at build time. Both are supported.
 */
function readSetting(locals: App.Locals, key: string): string | undefined {
  const runtimeEnv = (locals as { runtime?: { env?: Record<string, unknown> } })
    .runtime?.env;
  const value =
    runtimeEnv?.[key] ?? (import.meta.env as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : undefined;
}

/**
 * Read the payload of a Cloudflare Access JWT *without verifying it*.
 *
 * SECURITY: the signature is not checked here. This value is trustworthy only
 * because Cloudflare Access validates the token at the edge and refuses the
 * request before it reaches this code. If Access is not in front of the
 * hostname, anyone can forge this header.
 *
 * Therefore `locals.userEmail` is for DISPLAY ONLY. Never use it to decide
 * whether a request is allowed to see something — enforce that at the edge with
 * an Access policy, or verify the JWT signature against Cloudflare's public keys
 * before trusting it.
 */
function decodeJWT(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // base64url -> base64, then restore the padding atob() requires.
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '='
    );

    // atob() yields one byte per character; reassemble it as UTF-8 so that
    // non-ASCII characters in a name or email survive the round trip.
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  const url = new URL(context.request.url);
  const hostname = context.request.headers.get('host');

  // Identity, for display only. See the note on decodeJWT above.
  let email: string | null =
    context.request.headers.get('Cf-Access-Authenticated-User-Email') || null;

  if (!email) {
    const jwtToken = context.request.headers.get('Cf-Access-Jwt-Assertion');
    if (jwtToken) {
      const decoded = decodeJWT(jwtToken);
      if (decoded && typeof decoded.email === 'string') {
        email = decoded.email;
      }
    }
  }

  context.locals.userEmail = email;

  // The ?as=<slug> override is honored on localhost, and elsewhere only when
  // ALLOW_TENANT_OVERRIDE=true is set explicitly. It is not inferred from the
  // hostname, because *.pages.dev is publicly reachable.
  const overrideAllowed = isOverrideAllowed(
    hostname,
    readSetting(context.locals, 'ALLOW_TENANT_OVERRIDE')
  );
  context.locals.overrideAllowed = overrideAllowed;
  const override = overrideAllowed
    ? (url.searchParams.get('as') ?? undefined)
    : undefined;

  const baseDomain = readSetting(context.locals, 'SITE_BASE_DOMAIN');
  const derived = override ?? hostnameToSlug(hostname, baseDomain);
  context.locals.clientSlug = derived;

  if (derived && !clients[derived]) {
    context.locals.unknownClient = true;
  }

  const response = await next();

  // Preview hygiene: keep *.pages.dev out of search results. This is not an
  // access control — it only asks well-behaved crawlers not to index the page.
  if (isPagesDevHost(hostname)) {
    response.headers.set('X-Robots-Tag', 'noindex');
  }

  // Security headers baseline.
  const isApexMarketing = !derived;
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set(
    'Content-Security-Policy',
    isApexMarketing ? "frame-ancestors 'none'" : "frame-ancestors 'self'"
  );

  return response;
};
