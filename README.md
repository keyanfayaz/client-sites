# Multi-Client Astro

> **One codebase, many client sites.** A multi-tenant Astro framework for hosting multiple client sites with hostname-based routing, MDX content collections, and per-client theming.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Astro](https://img.shields.io/badge/Astro-4.x-ff5d01.svg)](https://astro.build)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-f38020.svg)](https://pages.cloudflare.com)

## 🔴 Live Demo

**[multi-client-astro.pages.dev](https://multi-client-astro.pages.dev)**

| Tenant | Mode | Demo link |
| --- | --- | --- |
| Landing page | — | [multi-client-astro.pages.dev](https://multi-client-astro.pages.dev) |
| Acme Corp | Internal knowledge base, identity-gated | [?as=acme](https://multi-client-astro.pages.dev/?as=acme) |
| Beta Industries | Public marketing site | [?as=beta](https://multi-client-astro.pages.dev/?as=beta) |

The two example tenants deliberately show the framework's two modes. **Acme** is an
internal employee wiki — onboarding, handbook, playbooks, and training — of the kind
you would put behind Cloudflare Access, where the signed-in identity is surfaced in
the header. **Beta** is an ordinary public company site with no gate in front of it.

The demo runs on a `*.pages.dev` host, where tenants are selected with `?as=<slug>`.
On a real domain the same tenants resolve automatically from the hostname
(`acme.example.com`), which is the mode described throughout this README.

## ✨ Features

- 🌐 **Hostname-Based Routing** — Automatically serve different content based on subdomain
- 🎨 **Per-Client Theming** — Custom colors, logos, and navigation for each client
- 📝 **MDX Content Collections** — Content-first approach with Markdown/MDX and Zod schemas
- 🔐 **Cloudflare Zero Trust** — Built-in support for Cloudflare Access authentication
- ⚡ **Lightning Fast** — Powered by Astro 4 SSR and Cloudflare Pages edge deployment

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/keyanfayaz/client-sites.git
cd client-sites

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit `http://localhost:4321?as=acme` or `http://localhost:4321?as=beta` to see the example client sites.

## 📋 Tech Stack

- **Framework**: [Astro 4](https://astro.build) (SSR mode)
- **Adapter**: [@astrojs/cloudflare](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) (Pages Functions)
- **UI**: [React](https://react.dev) + [TailwindCSS](https://tailwindcss.com)
- **Content**: [MDX](https://mdxjs.com) + [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com)

## 🏗️ Project Structure

```
├── content/
│   └── clients/              # Client content (MDX files)
│       ├── acme/             # Example tenant: internal knowledge base (gated)
│       └── beta/             # Example tenant: public marketing site
├── public/
│   ├── logos/                # Client logos
│   └── images/               # Static images
├── scripts/
│   └── new-client.ts         # CLI tool to scaffold new clients
├── src/
│   ├── content/
│   │   ├── clientPages/      # Synced content (auto-generated)
│   │   └── config.ts         # Content collection schemas
│   ├── layouts/
│   │   └── ClientLayout.astro # Main layout with theming
│   ├── lib/
│   │   ├── clients.ts        # Client registry (config, theme, nav)
│   │   ├── contentUtils.ts   # Content syncing utilities
│   │   └── navigation.ts     # Navigation builder
│   ├── middleware.ts         # Hostname → client slug routing
│   ├── pages/
│   │   ├── [...catchall].astro # Dynamic page renderer
│   │   └── index.astro       # Landing page
│   └── styles/
│       └── base.css          # Global styles
├── astro.config.mjs          # Astro configuration
├── package.json
└── tsconfig.json
```

## 🎯 How It Works

### Hostname-Based Routing

The middleware (`src/middleware.ts`) extracts the subdomain from the request hostname and maps it to a client slug:

- `acme.example.com` → `acme`
- `beta.example.com` → `beta`
- `localhost:4321?as=acme` → `acme` (override)
- `your-project.pages.dev/?as=acme` → `acme` (override)

The `?as=<slug>` override is honored only on `localhost` and `*.pages.dev`. On any
other host the slug comes from the hostname alone, so the override cannot be used to
reach another tenant's content in production.

### Client Configuration

Clients are defined in `src/lib/clients.ts`:

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
  // ... more clients
};
```

### Content Management

Content is authored in `content/clients/<slug>/` using MDX files with frontmatter:

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

Content is automatically synced to `src/content/clientPages/` during development and build.

## 🛠️ Adding a New Client

Use the built-in CLI tool:

```bash
pnpm new:client mycompany "My Company Name"
```

This will:
1. Create `content/clients/mycompany/index.mdx`
2. Add the client to `src/lib/clients.ts`
3. Sync content to `src/content/clientPages/`

Then:
1. Add a logo to `public/logos/mycompany.svg`
2. Customize the theme colors in `src/lib/clients.ts`
3. Add more MDX pages to `content/clients/mycompany/`

## 🚀 Deployment

### Cloudflare Pages

1. **Create a Pages project** pointing to your repository
   - Build command: `pnpm build`
   - Output directory: `dist`

2. **Set up custom domain**:
   - Add a wildcard DNS record: `*.example.com` CNAME to your Pages hostname
   - Add custom domain in Cloudflare Pages settings

3. **Configure Cloudflare Zero Trust Access** (optional):
   - Domain: `*.example.com/*`
   - Policy: One-Time PIN, email allowlists, or other authentication
   - Enable Access for preview URLs

The app automatically reads authenticated user email from Cloudflare Access headers and displays it in the UI.

### Preview Hygiene

The middleware automatically sets `X-Robots-Tag: noindex` for `*.pages.dev` preview deployments.

## 🔧 Development

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Format code
pnpm format

# Create new client
pnpm new:client <slug> "Client Name"

# Sync content manually
pnpm sync:content
```

### Local Development with Client Override

Use the `?as=<slug>` query parameter to test different clients locally:

- `http://localhost:4321?as=acme`
- `http://localhost:4321?as=beta`

## 📝 Content Collections

Content collections are defined in `src/content/config.ts` with Zod schemas:

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

## 🎨 Theming

Each client can have custom colors defined in `src/lib/clients.ts`:

```typescript
theme: {
  primary: '#2563eb',  // Primary brand color
  accent: '#f59e0b'    // Accent color
}
```

These are applied as CSS custom properties in `ClientLayout.astro`:

```css
--color-primary: <primary>;
--color-accent: <accent>;
```

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

We're open to:
- 🐛 Bug fixes
- ✨ Feature improvements
- 📚 Documentation updates
- 🎨 UI/UX enhancements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with:
- [Astro](https://astro.build) — The web framework for content-driven websites
- [Cloudflare Pages](https://pages.cloudflare.com) — Global edge deployment
- [TailwindCSS](https://tailwindcss.com) — Utility-first CSS framework

## 📧 Support

- 📖 [Documentation](https://github.com/keyanfayaz/client-sites#readme)
- 🐛 [Issue Tracker](https://github.com/keyanfayaz/client-sites/issues)
- 💬 [Discussions](https://github.com/keyanfayaz/client-sites/discussions)

---

Made with ❤️ using Astro and Cloudflare Pages
