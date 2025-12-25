/**
 * Prisma Client Singleton
 * 
 * This file creates a singleton Prisma client instance to avoid
 * creating multiple connections in serverless environments.
 * 
 * Note: If Prisma client generation fails, this will gracefully handle
 * the error and allow fallback to in-memory database.
 */

let PrismaClient: any;
let prismaInstance: any = null;

try {
  // Try to import Prisma Client (will fail if not generated)
  const prismaModule = require('@prisma/client');
  PrismaClient = prismaModule.PrismaClient;
  
  // PrismaClient is attached to the `global` object in development to prevent
  // exhausting your database connection limit in serverless environments.
  const globalForPrisma = globalThis as unknown as {
    prisma: any;
  };

  // For Supabase pooled connections, add ?pgbouncer=true to disable prepared statements
  // This fixes "prepared statement already exists" error
  let databaseUrl = process.env.DATABASE_URL || '';
  
  if (databaseUrl.includes('pooler.supabase.com') && !databaseUrl.includes('pgbouncer=true')) {
    databaseUrl += (databaseUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
  }
  
  prismaInstance = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl
      }
    },
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
} catch (error) {
  console.warn('⚠️ Prisma Client not available. Will use in-memory database fallback.');
  console.warn('To enable Prisma: 1) Set DATABASE_URL env var, 2) Run: npx prisma generate');
}

export const prisma = prismaInstance;

// Helper to check if Prisma is available
export function isPrismaAvailable(): boolean {
  return prismaInstance !== null;
}

export default prisma;

