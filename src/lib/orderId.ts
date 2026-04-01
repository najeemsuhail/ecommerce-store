import prisma from '@/lib/prisma';

const ORDER_ID_MIN = 1000;
const ORDER_ID_MAX = 9999;
const MAX_GENERATION_ATTEMPTS = 25;

function normalizePrefix(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

function derivePrefix(storeAbbreviation: string | null, storeName: string | null): string {
  const abbreviation = normalizePrefix(storeAbbreviation || '');
  if (abbreviation) {
    return abbreviation;
  }

  const namePrefix = normalizePrefix((storeName || '').replace(/\s+/g, ''));
  if (namePrefix) {
    return namePrefix;
  }

  return 'OINK';
}

function randomOrderId(prefix: string): string {
  const number = Math.floor(Math.random() * (ORDER_ID_MAX - ORDER_ID_MIN + 1)) + ORDER_ID_MIN;
  return `${prefix}${number}`;
}

export async function generateUniqueOrderId(): Promise<string> {
  const storeSettings = await prisma.storeSettings.findFirst({
    orderBy: { createdAt: 'asc' },
    select: {
      storeAbbreviation: true,
      storeName: true,
    },
  });
  const prefix = derivePrefix(storeSettings?.storeAbbreviation ?? null, storeSettings?.storeName ?? null);

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const candidate = randomOrderId(prefix);
    const existingOrder = await prisma.order.findUnique({
      where: { id: candidate },
      select: { id: true },
    });

    if (!existingOrder) {
      return candidate;
    }
  }

  throw new Error('Failed to generate a unique order ID');
}
