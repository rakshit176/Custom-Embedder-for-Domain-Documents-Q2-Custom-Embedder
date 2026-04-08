// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/persistence/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/brainmemory',
  },
} satisfies Config;
