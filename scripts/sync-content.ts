#!/usr/bin/env tsx
import { syncContentFiles } from '../src/lib/contentUtils';

syncContentFiles()
  .then(() => {
    console.log(
      'Content in sync: src/content/clientPages reflects content/clients'
    );
  })
  .catch((err) => {
    console.error('Content sync failed:', err);
    process.exit(1);
  });
