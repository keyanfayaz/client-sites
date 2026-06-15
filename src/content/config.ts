import { defineCollection, z } from 'astro:content';

const clientPages = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    navOrder: z.number().optional(),
    published: z.boolean().optional(),
    tags: z.array(z.string()).optional()
  })
});

export const collections = { clientPages };

