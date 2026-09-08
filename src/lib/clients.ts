export type ClientNavItem = {
  label: string;
  path: string;
};

export type ClientTheme = {
  primary: string;
  accent: string;
};

export type ClientConfig = {
  name: string;
  logoUrl: string;
  theme: ClientTheme;
  /**
   * Optional. Rendered navigation is built from the tenant's MDX files by
   * buildNavigation(), which overrides whatever is listed here — so this is
   * documentation of intent, not the source of truth for the menu.
   */
  nav?: ClientNavItem[];
};

export type ClientRegistry = Record<string, ClientConfig>;

export const clients: ClientRegistry = {
  acme: {
    name: 'Acme Corp',
    logoUrl: '/logos/acme.svg',
    theme: { primary: '#2563eb', accent: '#f59e0b' },
    nav: [
      { label: 'Home', path: '/' },
      { label: 'Getting Started', path: '/getting-started' },
      { label: 'Handbook', path: '/handbook' },
      { label: 'Playbooks', path: '/playbooks' },
      { label: 'Training', path: '/training' },
      { label: 'Resources', path: '/resources' }
    ]
  },
  beta: {
    name: 'Beta Industries',
    logoUrl: '/logos/beta.svg',
    theme: { primary: '#16a34a', accent: '#06b6d4' },
    nav: [
      { label: 'Home', path: '/' },
      { label: 'Services', path: '/services' },
      { label: 'Technology', path: '/technology' },
      { label: 'Case Studies', path: '/case-studies' },
      { label: 'Pricing', path: '/pricing' },
      { label: 'Contact', path: '/contact' }
    ]
  },
// @clients-marker
};

export function isKnownClient(slug: string | undefined): slug is keyof typeof clients {
  return Boolean(slug && Object.prototype.hasOwnProperty.call(clients, slug));
}

