/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    clientSlug?: string;
    unknownClient?: boolean;
    /**
     * Email reported by Cloudflare Access. DISPLAY ONLY — see the note on
     * decodeJWT in src/middleware.ts. Do not use this for authorization.
     */
    userEmail?: string | null;
    /**
     * Whether ?as=<slug> is honored for this request. Pages use it to avoid
     * offering override-based links on hosts where they cannot work.
     */
    overrideAllowed?: boolean;
    /** Injected by @astrojs/cloudflare; carries dashboard environment bindings. */
    runtime?: {
      env?: Record<string, unknown>;
    };
  }
}

interface ImportMetaEnv {
  /** "true" allows the ?as=<slug> tenant override on non-localhost hosts. */
  readonly ALLOW_TENANT_OVERRIDE?: string;
  /** Apex domain tenants sit beneath, e.g. "example.com" or "example.co.uk". */
  readonly SITE_BASE_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
