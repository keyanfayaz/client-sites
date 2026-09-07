import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentRoot = path.resolve(__dirname, '../../content/clients');
const clientPagesDir = path.resolve(__dirname, '../content/clientPages');

/**
 * Make `src/content/clientPages` reflect `content/clients`.
 *
 * Astro content collections must live under `src/content`, but tenant content
 * is authored at the repository root. The repository ships a symlink at
 * `src/content/clientPages` pointing at `content/clients`, which is all that is
 * needed on macOS, Linux and the Cloudflare build image.
 *
 * This function exists for checkouts where that symlink did not survive —
 * chiefly Windows without Developer Mode or `core.symlinks=true`, where git
 * writes a regular file containing the link target instead. In that case the
 * placeholder file is replaced with a real directory and the content is copied.
 *
 * Run explicitly by `pnpm sync:content`, and by `pnpm dev` / `pnpm build`
 * before Astro starts.
 */
export async function syncContentFiles(): Promise<void> {
  const state = await inspectTarget();

  if (state === 'symlink-to-source') {
    // Nothing to do: the symlink already exposes the source directory. Copying
    // here would copy every file onto itself.
    return;
  }

  if (state === 'placeholder-file') {
    // A Windows checkout of the symlink. Replace it with a real directory.
    await fs.rm(clientPagesDir, { force: true });
  }

  await fs.mkdir(clientPagesDir, { recursive: true });

  const clients = await fs.readdir(contentRoot, { withFileTypes: true });
  for (const client of clients) {
    if (!client.isDirectory()) continue;

    const sourceClientDir = path.join(contentRoot, client.name);
    const targetClientDir = path.join(clientPagesDir, client.name);
    await fs.mkdir(targetClientDir, { recursive: true });

    const files = await fs.readdir(sourceClientDir, { withFileTypes: true });
    for (const file of files) {
      if (!file.isFile()) continue;
      await fs.copyFile(
        path.join(sourceClientDir, file.name),
        path.join(targetClientDir, file.name)
      );
    }
  }
}

type TargetState =
  'symlink-to-source' | 'placeholder-file' | 'directory' | 'missing';

async function inspectTarget(): Promise<TargetState> {
  let stats;
  try {
    stats = await fs.lstat(clientPagesDir);
  } catch {
    return 'missing';
  }

  if (stats.isSymbolicLink()) {
    try {
      const resolved = await fs.realpath(clientPagesDir);
      if (resolved === (await fs.realpath(contentRoot)))
        return 'symlink-to-source';
    } catch {
      // Dangling symlink: fall through and rebuild it as a directory.
    }
    return 'placeholder-file';
  }

  if (stats.isDirectory()) return 'directory';
  return 'placeholder-file';
}
