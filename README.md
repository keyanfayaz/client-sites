# Multi-Client Astro

Serve many client sites from one Astro codebase. The hostname decides which tenant's content, theme, and navigation a visitor gets. Everything else is shared.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Astro](https://img.shields.io/badge/Astro-4.x-ff5d01.svg)](https://astro.build)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-f38020.svg)](https://pages.cloudflare.com)

## Live demo

**[multi-client-astro.pages.dev](https://multi-client-astro.pages.dev)**

| Tenant | Mode | Demo link |
| --- | --- | --- |
| Landing page | — | [multi-client-astro.pages.dev](https://multi-client-astro.pages.dev) |
| Acme Corp | Internal knowledge base, identity-gated | [?as=acme](https://multi-client-astro.pages.dev/?as=acme) |
| Beta Industries | Public marketing site | [?as=beta](https://multi-client-astro.pages.dev/?as=beta) |

The two tenants exist to show the two modes. Acme is an employee wiki, the sort of thing you put behind Cloudflare Access, and it shows the signed-in identity in the header. Beta is an ordinary public marketing site with nothing in front of it.

The demo runs on a `*.pages.dev` host, so tenants are selected with `?as=<slug>`. On a real domain they resolve from the hostname instead, which is what the rest of this README describes.

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

Then open `http://localhost:4321?as=acme` or `http://localhost:4321?as=beta`.

No environment variables are needed to run it.

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
│   │   ├── contentUtils.ts   # Content syncing
│   │   └── navigation.ts     # Builds nav from content entries
│   ├── middleware.ts         # Hostname to tenant slug
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

### Hostname routing

`src/middleware.ts` takes the subdomain off the request hostname and maps it to a tenant slug:

- `acme.example.com` → `acme`
- `beta.example.com` → `beta`
- `localhost:4321?as=acme` → `acme` (override)
- `your-project.pages.dev/?as=acme` → `acme` (override)

The `?as=<slug>` override works only on `localhost` and `*.pages.dev`. Anywhere else the slug comes from the hostname alone, so nobody can use the query parameter to read another tenant's content in production. That matters if one of your tenants is meant to be private.

An unknown slug renders an "unknown client" page rather than falling through to another tenant.

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
  },
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

`published: false` hides a page completely. Pages are filtered as they are loaded, in `src/lib/clientPages.ts`, so an unpublished page is absent from the navigation and requesting its URL returns a 404. It governs what the site serves, not what is in your repository: the MDX file is still there for anyone who can read the repo. `src/content/clientPages` is a symlink to `content/clients`, so new files are picked up without a copy step.

## Adding a tenant

```bash
pnpm new:client mycompany "My Company Name"
```

That creates `content/clients/mycompany/index.mdx`, adds the tenant to `src/lib/clients.ts`, and syncs content. After it runs, add a logo at `public/logos/mycompany.svg`, set the theme colors, and write more MDX pages.

## Deployment

### Cloudflare Pages

1. Create a Pages project pointing at your repository, with build command `pnpm build` and output directory `dist`.

2. Point a wildcard at it. Add a `*.example.com` CNAME to your Pages hostname, then add the custom domain in the Pages settings.

3. Optionally put tenants behind Cloudflare Access. Cover `*.example.com/*` with a policy such as one-time PIN or an email allowlist, and enable Access for preview URLs too.

The app reads the authenticated email from the Access headers and shows it in the layout. It never handles sign-in itself. Access enforcement happens at the edge, before a request reaches the app, so removing the policy removes the protection.

### Preview hygiene

The middleware sets `X-Robots-Tag: noindex` on `*.pages.dev` responses so preview deployments stay out of search results.

## Development

```bash
pnpm dev            # Start dev server
pnpm build          # Build for production
pnpm preview        # Preview the production build
pnpm typecheck      # tsc --noEmit
pnpm lint           # ESLint
pnpm format         # Prettier
pnpm new:client     # Scaffold a tenant: pnpm new:client <slug> "Name"
pnpm sync:content   # Sync content manually
```

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
    tags: z.array(z.string()).optional(),
  }),
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

## License

MIT. See [LICENSE](LICENSE).

## Links

- [Issues](https://github.com/keyanfayaz/client-sites/issues)
- [Discussions](https://github.com/keyanfayaz/client-sites/discussions)
