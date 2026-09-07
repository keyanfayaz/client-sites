#!/usr/bin/env tsx
import fs from 'node:fs/promises';
import path from 'node:path';
import { syncContentFiles } from '../src/lib/contentUtils';

const ROOT = process.cwd();

function usage() {
  console.log('Usage: pnpm new:client <slug> "Client Name"');
}

async function main() {
  const [, , slugArg, ...nameParts] = process.argv;
  if (!slugArg || nameParts.length === 0) {
    usage();
    process.exit(1);
  }
  const slug = slugArg.trim().toLowerCase();
  const name = nameParts.join(' ').trim();

  // Ensure slug is valid
  if (!/^([a-z0-9-]+)$/.test(slug)) {
    console.error('Slug must be lowercase alphanumeric with dashes.');
    process.exit(1);
  }

  const clientsTs = path.join(ROOT, 'src', 'lib', 'clients.ts');
  const clientDir = path.join(ROOT, 'content', 'clients', slug);

  // Idempotency
  const clientsSrc = await fs.readFile(clientsTs, 'utf8');

  const insertPoint = clientsSrc.indexOf('// @clients-marker');
  if (insertPoint === -1) {
    console.error('Marker not found in src/lib/clients.ts. Aborting.');
    process.exit(1);
  }

  // Search only the registry object, between `export const clients` and the
  // marker. Searching the whole file also matched same-indent property names in
  // the ClientConfig type declared above it, so a slug like `nav`, `name` or
  // `theme` was wrongly reported as already present and silently skipped.
  const registryStart = clientsSrc.indexOf('export const clients');
  const registryBody = clientsSrc.slice(
    registryStart === -1 ? 0 : registryStart,
    insertPoint
  );

  if (new RegExp(`^ {2}${slug}\\s*:`, 'm').test(registryBody)) {
    console.log(
      `Client '${slug}' already exists in registry. Skipping registry update.`
    );
  } else {
    const entry =
      `  ${slug}: {\n` +
      `    name: '${name}',\n` +
      `    logoUrl: '/logos/${slug}.svg',\n` +
      `    theme: { primary: '#0ea5e9', accent: '#a855f7' },\n` +
      `    nav: [\n` +
      `      { label: 'Home', path: '/' }\n` +
      `    ]\n` +
      `  },\n`;
    const updated =
      clientsSrc.slice(0, insertPoint) + entry + clientsSrc.slice(insertPoint);
    await fs.writeFile(clientsTs, updated, 'utf8');
    console.log(`Added '${slug}' to src/lib/clients.ts`);
  }

  // Scaffold content
  try {
    await fs.mkdir(clientDir, { recursive: false });
    console.log(`Created directory ${path.relative(ROOT, clientDir)}`);
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code !== 'EEXIST') throw e;
    console.log('Content directory already exists. Skipping.');
  }

  const indexMdxPath = path.join(clientDir, 'index.mdx');
  try {
    await fs.access(indexMdxPath);
    console.log('index.mdx already exists. Skipping.');
  } catch {
    const mdx =
      `---\n` +
      `title: ${name} Home\n` +
      `description: Welcome to ${name}\n` +
      `navOrder: 1\n` +
      `published: true\n` +
      `---\n\n` +
      `# ${name}\n\n` +
      `This is the homepage for ${name}.\n`;
    await fs.writeFile(indexMdxPath, mdx, 'utf8');
    console.log('Created index.mdx');
  }

  // Sync content to ensure new client is available
  await syncContentFiles();
  console.log('Synced content to src/content/clientPages');

  console.log('\nNext steps:');
  console.log(`- Add a logo at public/logos/${slug}.svg`);
  console.log(`- Set the theme colors for '${slug}' in src/lib/clients.ts`);
  console.log(
    `- If this tenant is private, cover https://${slug}.<your-domain>/* with a Cloudflare Access policy`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
