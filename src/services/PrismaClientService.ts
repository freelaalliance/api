import { PrismaClient } from '@prisma/client'

const environment = process.env.NODE_ENV || 'development'

export const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
})
