import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import {
  hostnameToSlug,
  isLocalHost,
  isOverrideAllowed,
  isPagesDevHost,
  normalizeHost
} from '../src/lib/tenant';

describe('normalizeHost', () => {
  it('strips the port and lowercases', () => {
    assert.equal(normalizeHost('ACME.Example.COM:443'), 'acme.example.com');
  });

  it('strips a fully-qualified trailing dot', () => {
    assert.equal(normalizeHost('acme.example.com.'), 'acme.example.com');
  });

  it('keeps bracketed IPv6 literals intact', () => {
    assert.equal(normalizeHost('[::1]:4321'), '[::1]');
  });

  it('handles a missing header', () => {
    assert.equal(normalizeHost(null), '');
    assert.equal(normalizeHost(undefined), '');
  });
});

describe('hostnameToSlug — heuristic mode (no SITE_BASE_DOMAIN)', () => {
  it('maps a subdomain to a tenant', () => {
    assert.equal(hostnameToSlug('acme.example.com'), 'acme');
    assert.equal(hostnameToSlug('beta.example.com'), 'beta');
  });

  it('is case insensitive, because Host is', () => {
    // Regression: uppercase hosts used to yield "ACME", which matches no
    // registry key and rendered the "unknown client" page.
    assert.equal(hostnameToSlug('ACME.example.com'), 'acme');
  });

  it('treats www as the landing page, not a tenant', () => {
    // Regression: www.example.com used to resolve to the slug "www".
    assert.equal(hostnameToSlug('www.example.com'), undefined);
  });

  it('sees through www in front of a tenant', () => {
    assert.equal(hostnameToSlug('www.acme.example.com'), 'acme');
  });

  it('returns undefined for an apex domain', () => {
    assert.equal(hostnameToSlug('example.com'), undefined);
  });

  it('returns undefined for localhost and pages.dev', () => {
    assert.equal(hostnameToSlug('localhost:4321'), undefined);
    assert.equal(hostnameToSlug('proj.pages.dev'), undefined);
  });
});

describe('hostnameToSlug — explicit SITE_BASE_DOMAIN', () => {
  it('resolves the apex of a multi-label suffix to no tenant', () => {
    // The heuristic cannot get this right; the base domain makes it exact.
    assert.equal(hostnameToSlug('example.co.uk', 'example.co.uk'), undefined);
    assert.equal(
      hostnameToSlug('www.example.co.uk', 'example.co.uk'),
      undefined
    );
  });

  it('resolves a tenant beneath a multi-label suffix', () => {
    assert.equal(hostnameToSlug('acme.example.co.uk', 'example.co.uk'), 'acme');
    assert.equal(
      hostnameToSlug('www.acme.example.co.uk', 'example.co.uk'),
      'acme'
    );
  });

  it('refuses hosts outside the configured base domain', () => {
    assert.equal(hostnameToSlug('acme.attacker.com', 'example.com'), undefined);
    // Suffix confusion: notexample.com must not match base example.com.
    assert.equal(
      hostnameToSlug('acme.notexample.com', 'example.com'),
      undefined
    );
  });
});

describe('isOverrideAllowed', () => {
  it('always allows localhost', () => {
    assert.equal(isOverrideAllowed('localhost:4321', undefined), true);
    assert.equal(isOverrideAllowed('127.0.0.1', undefined), true);
  });

  it('fails closed on pages.dev unless explicitly enabled', () => {
    // Regression: *.pages.dev used to be treated as implicitly safe, which
    // exposed private tenants at <project>.pages.dev/?as=<slug>.
    assert.equal(isOverrideAllowed('proj.pages.dev', undefined), false);
    assert.equal(isOverrideAllowed('proj.pages.dev', 'false'), false);
    assert.equal(isOverrideAllowed('proj.pages.dev', 'true'), true);
  });

  it('fails closed on a production hostname', () => {
    assert.equal(isOverrideAllowed('acme.example.com', undefined), false);
  });

  it('never honors the override on a custom domain, even when enabled', () => {
    // Enabling the flag for a demo or preview deployment must not be able to
    // open a cross-tenant read on a real domain served by the same project.
    assert.equal(isOverrideAllowed('acme.example.com', 'true'), false);
    assert.equal(isOverrideAllowed('www.example.com', true), false);
  });

  it('does not treat arbitrary truthy strings as enabled', () => {
    assert.equal(isOverrideAllowed('proj.pages.dev', 'yes'), false);
    assert.equal(isOverrideAllowed('proj.pages.dev', '1'), false);
  });
});

describe('host classification helpers', () => {
  it('identifies local hosts', () => {
    assert.equal(isLocalHost('localhost'), true);
    assert.equal(isLocalHost('app.localhost:4321'), true);
    assert.equal(isLocalHost('acme.example.com'), false);
    // Must not be fooled by a lookalike registrable domain.
    assert.equal(isLocalHost('localhost.attacker.com'), false);
  });

  it('identifies pages.dev hosts', () => {
    assert.equal(isPagesDevHost('proj.pages.dev'), true);
    assert.equal(isPagesDevHost('abc123.proj.pages.dev'), true);
    assert.equal(isPagesDevHost('acme.example.com'), false);
  });
});
