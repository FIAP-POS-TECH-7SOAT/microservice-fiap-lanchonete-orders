// setupDatabase.ts
import { PrismaClient } from '@prisma/client';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { execSync } from 'child_process';

export async function resetDatabase(prisma: PrismaClient) {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE orders, order_product RESTART IDENTITY CASCADE;
  `);
}

export async function setupDatabase() {
  const container = await new PostgreSqlContainer().start();
  const urlConnection = `postgresql://${container.getUsername()}:${container.getPassword()}@${container.getHost()}:${container.getPort()}/${container.getDatabase()}?schema=public`;

  process.env.DATABASE_URL = urlConnection;

  execSync('npx prisma db push', {
    env: {
      ...process.env,
      DATABASE_URL: urlConnection,
    },
  });

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: urlConnection,
      },
    },
  });

  return { prisma, container };
}

export async function teardownDatabase(container: StartedPostgreSqlContainer) {
  await container.stop();
}
