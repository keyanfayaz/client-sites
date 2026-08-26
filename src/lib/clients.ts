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
  nav: ClientNavItem[];
};

export type ClientRegistry = Record<string, ClientConfig>;

export const clients: ClientRegistry = {
  acme: {
    name: 'Acme Corp',
    logoUrl: '/logos/acme.svg',
    theme: { primary: '#2563eb', accent: '#f59e0b' },
    nav: [
      { label: 'Home', path: '/' },
      { label: 'Features', path: '/features' },
      { label: 'Solutions', path: '/solutions' },
      { label: 'Pricing', path: '/pricing' },
      { label: 'About', path: '/about' },
      { label: 'Contact', path: '/contact' }
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

