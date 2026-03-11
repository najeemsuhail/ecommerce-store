import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient
}

function buildPrismaUrl() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl || !databaseUrl.startsWith('postgres')) {
    return undefined
  }

  const url = new URL(databaseUrl)

  if (!url.searchParams.has('connection_limit')) {
    url.searchParams.set('connection_limit', '1')
  }

  if (!url.searchParams.has('pool_timeout')) {
    url.searchParams.set('pool_timeout', '20')
  }

  return url.toString()
}

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    datasourceUrl: buildPrismaUrl(),
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma

