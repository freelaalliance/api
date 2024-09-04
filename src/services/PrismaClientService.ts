import { PrismaClient } from '@prisma/client'
export const prisma = new PrismaClient({
  log: ['query'],
  // debug: true, Enable to log all queries, mutations and errors to the console.
})
