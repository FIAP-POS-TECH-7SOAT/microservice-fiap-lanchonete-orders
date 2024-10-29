// jest.setup.js

import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { setupDatabase, teardownDatabase } from './setup-database';

let container: StartedPostgreSqlContainer;

beforeAll(async () => {
  const dbSetup = await setupDatabase();
  global.prisma = dbSetup.prisma;
  container = dbSetup.container;
});

afterAll(async () => {
  await teardownDatabase(container);
  await global.prisma.$disconnect();
});
