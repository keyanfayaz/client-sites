# Security Policy

## Reporting a vulnerability

Please report security issues through GitHub's private vulnerability reporting:
open the repository's **Security** tab and choose **Report a vulnerability**.
That keeps the report private until a fix is available.

Please do not open a public issue for a security problem.

## What this project does and does not do

This is a template. It renders tenant content selected by hostname. Understanding
where the trust boundary sits matters more here than in most projects, because it
is easy to assume the app enforces something it does not.

**The app does not authenticate anyone.** It never handles sign-in, sessions, or
passwords. When a tenant is private, enforcement belongs to Cloudflare Access at
the edge, in front of the app. Removing the Access policy removes the protection.

**`Astro.locals.userEmail` is display only.** It comes from the
`Cf-Access-Jwt-Assertion` header, whose signature this app does not verify — it
relies on Access having validated the token upstream. If Access is not in front
of the hostname, that header can be forged by anyone. Do not use this value to
decide what a request is allowed to see. If you need verified identity in the
app, validate the JWT against Cloudflare's public keys first.

**Every Cloudflare Pages project is also served at `<project>.pages.dev`.** An
Access policy on your custom domain does not cover that hostname. Cover both.

**`published: false` is not a secret.** It removes a page from the navigation and
makes its URL 404, but the MDX file is still in the repository for anyone who can
read it.

**The `?as=<slug>` override** is honored on `localhost` always, on `*.pages.dev`
only when `ALLOW_TENANT_OVERRIDE=true`, and on a custom domain never. See the
README for the reasoning.

## Supported versions

This project is pre-1.0 and fixes land on `main`. There are no backported
security releases.
