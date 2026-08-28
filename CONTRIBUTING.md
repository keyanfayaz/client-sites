# Contributing to Multi-Client Astro

Bug fixes, documentation, and new example tenants are all welcome. This page covers how to get set up and what to expect from review.

## Scope

The project hosts multiple client sites from one Astro codebase. Changes that make that easier are in scope: routing, theming, content handling, deployment, and documentation.

Features that only make sense for a single tenant are usually better in your own fork. If you are unsure, open an issue before writing the code.

## Reporting bugs

Search the existing issues first, then include:

- What you did, step by step
- What you expected, and what happened instead
- Node version, OS, and browser
- A code sample or a link to a repository that reproduces it

A reproduction is worth more than a description. Most bugs that go unfixed are the ones nobody can reproduce.

## Suggesting features

Open an issue that explains the use case before the solution. Say what you were trying to do and where the current design got in the way. Smaller proposals get reviewed faster than large ones.

## Development setup

Requires Node 18.17.0 or higher and pnpm.

```bash
git clone https://github.com/keyanfayaz/client-sites.git
cd client-sites
pnpm install
pnpm dev
```

No environment variables are needed.

### Scripts

- `pnpm dev` — start the dev server
- `pnpm build` — build for production
- `pnpm preview` — preview the production build
- `pnpm typecheck` — run `tsc --noEmit`
- `pnpm lint` — run ESLint
- `pnpm format` — run Prettier
- `pnpm new:client <slug> "Name"` — scaffold a tenant

## Pull requests

Branch from `main`, then before you open the PR:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

CI runs the same install and build on Node 18 and 20, so a green local build usually means a green CI run. The lockfile is committed and CI installs with `--frozen-lockfile`, so if you change dependencies, commit the updated `pnpm-lock.yaml` or CI will fail before it builds.

Check both example tenants still render, since routing changes tend to break one and not the other:

- `http://localhost:4321?as=acme`
- `http://localhost:4321?as=beta`

In the PR description, say what changed and how you tested it. Include screenshots for UI changes.

### Commit messages

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `style:` formatting
- `refactor:` restructuring without behavior change
- `perf:` performance
- `test:` tests
- `chore:` maintenance

## Code style

Prettier and ESLint decide formatting, so run them rather than matching style by hand.

Beyond that:

- Write TypeScript, and type props on Astro components
- Style with Tailwind utilities, and use the `--color-primary` and `--color-accent` custom properties for anything tenant-specific, so themes keep working
- Comment the reasoning behind non-obvious code, not what the code already says

Tenant-specific styling belongs in CSS custom properties rather than a forked component. If you find yourself branching on the tenant slug in a component, that is usually a sign the theme needs another variable.

## Testing

There are no automated tests yet, and adding them would be a genuinely useful contribution.

Until then, check by hand that the build succeeds, typecheck and lint pass, both example tenants render, navigation between pages works, and the browser console is clean.

Navigation is worth testing specifically. The `?as=<slug>` override has to survive a page change, so click through the nav rather than only loading one page.

## Documentation

Update the README when you change behavior it describes. Code examples in the README are copied by people who have not read the source, so keep them working.

## Questions

Open a [Discussion](https://github.com/keyanfayaz/client-sites/discussions) or check the [Issues](https://github.com/keyanfayaz/client-sites/issues).

## Code of conduct

Be respectful, accept review feedback in good faith, and assume good intent. Harassment, discriminatory language, personal attacks, and publishing other people's private information are not tolerated and will result in a ban.

Report problems through a GitHub issue or directly to the maintainers.

## License

Contributions are licensed under the MIT License.
