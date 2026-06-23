import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

function createPrismaClient() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        // Return a mock client that fails gracefully if used before DATABASE_URL is set.
        // This prevents the serverless function from crashing at cold-start when env vars
        // are not yet available (e.g. during build / pre-deployment).
        console.warn('DATABASE_URL is not set — Prisma will throw if queried');
        return new PrismaClient();
    }

    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
}

export const prisma = createPrismaClient();