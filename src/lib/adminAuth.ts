import { NextRequest } from 'next/server';
import { extractToken, verifyToken } from './auth';
import prisma from './prisma';

const DEFAULT_ADMIN_EMAILS = ['suhail.najeem@gmail.com'];

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || process.env.ADMIN_NOTIFICATION_EMAILS || '';
  const emails = raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return emails.length > 0 ? emails : DEFAULT_ADMIN_EMAILS;
}

export async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return false;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return false;
    }

    // New tokens carry isAdmin directly, which avoids a DB lookup on every admin API request.
    if (decoded.isAdmin === true) {
      return true;
    }

    if (decoded.isAdmin === false) {
      return false;
    }

    // Fall back for older tokens that do not include the admin flag.
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { email: true },
    });

    if (!user) {
      return false;
    }

    return isAdminEmail(user.email);
  } catch {
    return false;
  }
}

export function isAdminEmail(email: string): boolean {
  return getAdminEmails().includes(email.trim().toLowerCase());
}
