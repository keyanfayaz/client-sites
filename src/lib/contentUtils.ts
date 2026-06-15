import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentRoot = path.resolve(__dirname, '../../content/clients');

/**
 * Utility to copy content files from content/clients to src/content/clientPages
 * This replaces the symlink approach which doesn't work in Cloudflare
 */
export async function syncContentFiles() {
  const srcContentDir = path.resolve(__dirname, '../content');
  const clientPagesDir = path.resolve(srcContentDir, 'clientPages');
  
  // Ensure target directory exists
  await fs.mkdir(clientPagesDir, { recursive: true });
  
  // Read all client directories
  const clients = await fs.readdir(contentRoot);
  
  for (const client of clients) {
    const sourceClientDir = path.join(contentRoot, client);
    const targetClientDir = path.join(clientPagesDir, client);
    
    // Check if it's a directory
    const stat = await fs.stat(sourceClientDir);
    if (!stat.isDirectory()) continue;
    
    // Ensure client directory exists in target
    await fs.mkdir(targetClientDir, { recursive: true });
    
    // Read all files in client directory
    const files = await fs.readdir(sourceClientDir);
    
    for (const file of files) {
      const sourcePath = path.join(sourceClientDir, file);
      const targetPath = path.join(targetClientDir, file);
      
      // Skip directories
      const fileStat = await fs.stat(sourcePath);
      if (fileStat.isDirectory()) continue;
      
      // Copy the file
      await fs.copyFile(sourcePath, targetPath);
    }
  }
  
  console.log('Content files synced from content/clients to src/content/clientPages');
}

/**
 * Helper to sync content during development
 * Returns a watcher function that can be used in Astro's dev mode
 */
export function getContentWatcher() {
  let timeout: NodeJS.Timeout | null = null;
  
  // Initial sync
  syncContentFiles().catch(console.error);
  
  return async (event: { type: string; path: string }) => {
    // Debounce file changes
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      if (event.path.includes('/content/clients/')) {
        syncContentFiles().catch(console.error);
      }
    }, 300);
  };
}
