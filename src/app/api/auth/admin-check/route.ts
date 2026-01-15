import { NextRequest, NextResponse } from 'next/server';
import { extractToken, verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

const ADMIN_EMAILS = ['suhail.najeem@gmail.com'];

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json({ isAdmin: false });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ isAdmin: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { email: true },
    });

    if (!user) {
      return NextResponse.json({ isAdmin: false });
    }

    const isAdmin = ADMIN_EMAILS.includes(user.email);
    return NextResponse.json({ isAdmin });
  } catch (error) {
    return NextResponse.json({ isAdmin: false });
  }
}
