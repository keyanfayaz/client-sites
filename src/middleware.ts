import type { MiddlewareHandler } from 'astro';
import { clients } from './lib/clients';

/**
 * Decode a JWT token to extract the payload (without verification)
 * Cloudflare Access already verifies the JWT, we just need to read it
 */
function decodeJWT(token: string): Record<string, any> | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload (second part)
    const payload = parts[1];
    // Add padding if needed
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

function hostnameToSlug(hostname: string | null): string | undefined {
  if (!hostname) return undefined;
  const host = hostname.split(':')[0];
  const parts = host.split('.');
  
  // localhost and dev: rely on ?as=slug
  if (host.startsWith('localhost')) return undefined;
  if (host.endsWith('.pages.dev')) return undefined;
  
  // Handle www subdomain - strip it and check again
  if (parts[0] === 'www' && parts.length >= 4) {
    return parts[1]; // www.beta.example.com -> beta
  }
  
  // For subdomains like beta.example.com or beta.my-domain.com
  if (parts.length >= 3) {
    return parts[0];
  }
  
  return undefined; // apex domain handled by index page
}

function isDevelopmentEnvironment(hostname: string | null): boolean {
  if (!hostname) return false;
  const host = hostname.split(':')[0];
  
  // Local development
  if (host.startsWith('localhost') || host === '127.0.0.1') return true;
  
  // Cloudflare Pages preview environments
  if (host.endsWith('.pages.dev')) return true;
  
  return false;
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  const url = new URL(context.request.url);
  const hostname = context.request.headers.get('host');

  // Derive slug: dev override via ?as=slug ONLY in development environments
  const isDevEnv = isDevelopmentEnvironment(hostname);
  
  // Access email header (not for auth, display only)
  // Cloudflare Access sends user info in a JWT token, not as a direct header
  let email: string | null = null;
  
  // First, try the direct email header (legacy/fallback)
  email = context.request.headers.get('Cf-Access-Authenticated-User-Email') 
    || context.request.headers.get('CF-Access-Authenticated-User-Email')
    || null;
  
  // If no direct email header, decode the JWT token from Cloudflare Access
  if (!email) {
    const jwtToken = context.request.headers.get('Cf-Access-Jwt-Assertion');
    if (jwtToken) {
      const decoded = decodeJWT(jwtToken);
      if (decoded && decoded.email) {
        email = decoded.email;
      }
    }
  }
  
  context.locals.userEmail = email;
  const override = isDevEnv ? (url.searchParams.get('as') ?? undefined) : undefined;
  const derived = override ?? hostnameToSlug(hostname);
  context.locals.clientSlug = derived;

  if (derived && !clients[derived]) {
    context.locals.unknownClient = true;
  }

  const response = await next();

  // Preview hygiene: noindex on *.pages.dev
  const host = context.request.headers.get('host') || '';
  if (host.endsWith('.pages.dev')) {
    response.headers.set('X-Robots-Tag', 'noindex');
  }

  // Security headers baseline
  const isApexMarketing = !derived;
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set(
    'Content-Security-Policy',
    isApexMarketing ? "frame-ancestors 'none'" : "frame-ancestors 'self'"
  );

  return response;
};

