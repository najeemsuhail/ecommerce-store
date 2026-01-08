import { NextRequest } from 'next/server';
import { extractToken, verifyToken } from './auth';
import prisma from './prisma';

// List of admin emails - You can move this to database later
const ADMIN_EMAILS = ['suhail.najeem@gmail.com']; // Add your admin email here

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

    // Check if user exists and is admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return false;
    }

    // Check if email is in admin list
    return ADMIN_EMAILS.includes(user.email);
  } catch (error) {
    return false;
  }
}

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email);
}