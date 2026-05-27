import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { defineConfig } from 'prisma/config';

/** Prisma master configuration */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx ts-node prisma/seed.ts',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
