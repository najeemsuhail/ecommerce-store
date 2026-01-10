import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { extractToken, verifyToken } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { addresses } = body;

    // Update user addresses
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        address: addresses,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Addresses updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update addresses error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update addresses' },
      { status: 500 }
    );
  }
}