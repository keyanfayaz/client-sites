# Multi-Client Astro

Serve many client sites from one Astro codebase. The hostname decides which tenant's content, theme, and navigation a visitor gets. Everything else is shared.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Astro](https://img.shields.io/badge/Astro-4.x-ff5d01.svg)](https://astro.build)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-f38020.svg)](https://pages.cloudflare.com)

## Live demo

**[multi-client-astro.pages.dev](https://multi-client-astro.pages.dev)**

| Tenant          | Mode                    | Demo link                                                            |
| --------------- | ----------------------- | -------------------------------------------------------------------- |
| Landing page    | —                       | [multi-client-astro.pages.dev](https://multi-client-astro.pages.dev) |
| Acme Corp       | Internal knowledge base | [?as=acme](https://multi-client-astro.pages.dev/?as=acme)            |
| Beta Industries | Public marketing site   | [?as=beta](https://multi-client-astro.pages.dev/?as=beta)            |

The two tenants exist to show the two modes. Acme is an employee wiki, the sort of thing you put behind Cloudflare Access, and it shows the signed-in identity in the header. Beta is an ordinary public marketing site with nothing in front of it.

Both are public on the demo, which has no Access policy in front of it: the demo sets `ALLOW_TENANT_OVERRIDE=true` so that one deployment can show both tenants from `?as=<slug>` links. Acme's header therefore reads "Not signed in". A real deployment resolves tenants from the hostname and leaves that setting off — see [Tenant selection](#tenant-selection).

## What it does

- Routes by hostname, so `acme.example.com` and `beta.example.com` serve different content from one deployment
- Gives each tenant its own colors, logo, and navigation from a single registry entry
- Takes content as MDX files with a Zod-checked frontmatter schema
- Reads the signed-in user from Cloudflare Access headers when a tenant sits behind Zero Trust
- Runs as Astro SSR on Cloudflare Pages

Navigation is derived from the content files rather than maintained by hand. Add an MDX page with a `navOrder` and it shows up in the nav.

## Quick start

```bash
git clone https://github.com/keyanfayaz/client-sites.git
cd client-sites
pnpm install
pnpm dev
```

Then open `http://localhost:4321/?as=acme` or `http://localhost:4321/?as=beta`.
The `?as=` override is always available on localhost.

No environment variables are needed to run it locally. Requires Node 20.3+ and pnpm
(the version is pinned by the `packageManager` field, so `corepack enable` is enough).

## Tech stack

- **Framework**: [Astro 4](https://astro.build) in SSR mode
- **Adapter**: [@astrojs/cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/), targeting Pages Functions
- **UI**: [React](https://react.dev) and [TailwindCSS](https://tailwindcss.com)
- **Content**: [MDX](https://mdxjs.com) with [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- **Hosting**: [Cloudflare Pages](https://pages.cloudflare.com)

## Project structure

```
├── content/
│   └── clients/              # Tenant content (MDX)
│       ├── acme/             # Example tenant: internal knowledge base (gated)
│       └── beta/             # Example tenant: public marketing site
├── public/
│   ├── logos/                # Tenant logos
│   └── images/               # Static images
├── scripts/
│   └── new-client.ts         # Scaffolds a new tenant
├── src/
│   ├── content/
│   │   ├── clientPages/      # Symlink to content/clients
│   │   └── config.ts         # Collection schema
│   ├── layouts/
│   │   └── ClientLayout.astro # Shared layout, applies the tenant theme
│   ├── lib/
│   │   ├── clientPages.ts    # Loads a tenant's published pages
│   │   ├── clients.ts        # Tenant registry: theme, logo, nav
│   │   ├── contentUtils.ts   # Content syncing (Windows fallback)
│   │   ├── navigation.ts     # Builds nav from content entries
│   │   └── tenant.ts         # Hostname/override to tenant slug
│   ├── middleware.ts         # Applies tenant.ts to each request
│   ├── pages/
│   │   ├── [...catchall].astro # Renders any tenant page
│   │   └── index.astro       # Landing page and tenant home
│   └── styles/
│       └── base.css
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## How it works

### Tenant selection

`src/middleware.ts` maps the request hostname to a tenant slug. The rules live in
`src/lib/tenant.ts` and are covered by tests in `tests/tenant.test.ts`.

- `acme.example.com` → `acme`
- `beta.example.com` → `beta`
- `www.acme.example.com` → `acme`
- `example.com`, `www.example.com` → no tenant, landing page
- `localhost:4321/?as=acme` → `acme` (override)

Set `SITE_BASE_DOMAIN` to the apex your tenants sit beneath. Tenant resolution is
then exact. Without it a heuristic applies — three or more labels means the first
label is the tenant — which is correct for `acme.example.com` but cannot tell an
apex on a multi-label public suffix such as `example.co.uk` from a subdomain.

#### The `?as=<slug>` override

The override exists so one deployment can show several tenants without DNS. It is
gated in three tiers, and fails closed:

| Host                      | `?as=` honored?                        |
| ------------------------- | -------------------------------------- |
| `localhost` / `127.0.0.1` | Always                                 |
| `*.pages.dev`             | Only when `ALLOW_TENANT_OVERRIDE=true` |
| Any custom domain         | **Never**, whatever the setting says   |

The last two rows matter if any tenant is meant to be private. A Cloudflare Pages
project is always served at `<project>.pages.dev` in addition to any custom domain,
so a preview host that honored `?as=` unconditionally would expose a private tenant
at `<project>.pages.dev/?as=<slug>` even with Access covering the custom domain. And
because a custom domain never honors the override, enabling the flag for a demo
cannot open a cross-tenant read on production, even when the same project serves both.

This is defense in depth, not the access control itself. If a tenant is private,
put a Cloudflare Access policy in front of it — including its `*.pages.dev`
hostname. See [Deployment](#deployment).

A hostname that resolves to a slug with no registry entry renders an "unknown client"
page with a 404, rather than falling through to another tenant or to the landing page.

### Tenant configuration

Tenants live in `src/lib/clients.ts`:

```typescript
export const clients: ClientRegistry = {
  acme: {
    name: 'Acme Corp',
    logoUrl: '/logos/acme.svg',
    theme: { primary: '#2563eb', accent: '#f59e0b' },
    nav: [
      { label: 'Home', path: '/' },
      { label: 'Getting Started', path: '/getting-started' },
      { label: 'Handbook', path: '/handbook' }
    ]
  }
  // ... more tenants
};
```

One wrinkle worth knowing: the `nav` array here is overridden at render time by `buildNavigation()`, which reads the tenant's MDX files and orders them by `navOrder`. Keep the registry list accurate so the config stays readable, but the content files are what actually drive the menu.

### Content

Content is authored in `content/clients/<slug>/` as MDX with frontmatter:

```mdx
---
title: Handbook
description: Standards, quality policy, and the operating rules
navOrder: 3
published: true
tags: [handbook, policy]
---

# Handbook

Your content here...
```

`published: false` hides a page completely. Pages are filtered as they are loaded, in `src/lib/clientPages.ts`, so an unpublished page is absent from the navigation and requesting its URL returns a 404. It governs what the site serves, not what is in your repository: the MDX file is still there for anyone who can read the repo. `content/clients/acme/salary-bands.mdx` is committed as an example.

Astro content collections must live under `src/content`, so `src/content/clientPages` is a symlink to `content/clients`. On macOS, Linux and the Cloudflare build image that is all that is needed. `pnpm sync:content` — which `pnpm dev` and `pnpm build` run first — checks the symlink and does nothing when it resolves correctly. It exists for Windows checkouts without symlink support, where git writes a regular file instead of a link; there it replaces the placeholder with a real directory and copies the content in.

## Adding a tenant

```bash
pnpm new:client mycompany "My Company Name"
```

That creates `content/clients/mycompany/index.mdx`, adds the tenant to `src/lib/clients.ts`, and syncs content. After it runs, add a logo at `public/logos/mycompany.svg`, set the theme colors, and write more MDX pages.

## Deployment

### Cloudflare Pages

1. Create a Pages project pointing at your repository, with build command `pnpm build` and output directory `dist`.

2. Point a wildcard at it. Add a `*.example.com` CNAME to your Pages hostname, then add the custom domain in the Pages settings.

3. Set `SITE_BASE_DOMAIN` to your apex (e.g. `example.com`) in the project's environment variables.

4. If any tenant is private, put it behind Cloudflare Access. Cover `*.example.com/*` with a policy such as one-time PIN or an email allowlist — **and cover the project's `*.pages.dev` hostname as well**. Every Pages project stays reachable at `<project>.pages.dev`, so a policy on the custom domain alone leaves that door open.

The app reads the authenticated email from the Access headers and shows it in the layout. It never handles sign-in itself. Access enforcement happens at the edge, before a request reaches the app, so removing the policy removes the protection.

The JWT is decoded without verifying its signature, because Access has already
validated it upstream. `Astro.locals.userEmail` is therefore **display only** — if
Access is not in front of the hostname, anyone can forge that header. Do not use it
to decide what a request is allowed to see.

### Configuration

Both variables are optional. Set them in the Pages project settings, or in a local
`.env` file for development.

| Variable                | Default | Effect                                                                                                                                               |
| ----------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SITE_BASE_DOMAIN`      | unset   | Apex the tenants sit beneath, e.g. `example.com`. Makes tenant resolution exact instead of heuristic. Recommended in production.                     |
| `ALLOW_TENANT_OVERRIDE` | unset   | Set to `true` to honor `?as=<slug>` on `*.pages.dev`. Leave unset unless every tenant on the deployment is public. Never applies to a custom domain. |

### Preview hygiene

The middleware sets `X-Robots-Tag: noindex` on `*.pages.dev` responses so preview deployments stay out of search results. That keeps previews out of search engines; it is not an access control.

## Development

```bash
pnpm dev            # Start dev server
pnpm build          # Build for production
pnpm preview        # Preview the production build with wrangler
pnpm test           # Unit tests (node:test)
pnpm typecheck      # tsc --noEmit
pnpm lint           # ESLint
pnpm format         # Prettier
pnpm new:client     # Scaffold a tenant: pnpm new:client <slug> "Name"
pnpm sync:content   # Reconcile src/content/clientPages (Windows fallback)
```

`pnpm dev` and `pnpm build` run `sync:content` first, so it is rarely needed on its own.

To work on a specific tenant locally, use the `?as=<slug>` override:

- `http://localhost:4321?as=acme`
- `http://localhost:4321?as=beta`

## Content collections

The schema lives in `src/content/config.ts`:

```typescript
const clientPages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    navOrder: z.number().optional(),
    published: z.boolean().optional(),
    tags: z.array(z.string()).optional()
  })
});
```

Frontmatter that fails the schema breaks the build rather than shipping a half-rendered page.

## Theming

Each tenant sets two colors in `src/lib/clients.ts`:

```typescript
theme: {
  primary: '#2563eb',
  accent: '#f59e0b'
}
```

`ClientLayout.astro` applies them as CSS custom properties, so tenant styling stays in CSS instead of forking components:

```css
--color-primary: <primary>;
--color-accent: <accent>;
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Bug fixes, documentation, and new example tenants are all useful.

Run `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` before opening a PR; CI runs all four on Node 20 and 22.

## License

MIT. See [LICENSE](LICENSE).

## Links

- [Issues](https://github.com/keyanfayaz/client-sites/issues)
