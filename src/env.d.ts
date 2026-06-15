/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    clientSlug?: string;
    unknownClient?: boolean;
    userEmail?: string | null;
  }
}

