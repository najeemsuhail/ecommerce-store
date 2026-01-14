import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { extractToken, verifyToken } from '@/lib/auth';

async function getUser(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  const token = extractToken(authHeader);
  
  if (!token) {
    return null;
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }
  
  return decoded.userId;
}

// GET all wishlist groups for the user
export async function GET(request: NextRequest) {
  try {
    const userId = await getUser(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const groups = await prisma.wishlistGroup.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            group: false,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({
      success: true,
      groups,
    });
  } catch (error) {
    console.error('Failed to fetch wishlist groups:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wishlist groups' },
      { status: 500 }
    );
  }
}

// POST create a new wishlist group
export async function POST(request: NextRequest) {
  try {
    const userId = await getUser(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { name } = await request.json();
    
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Group name is required' },
        { status: 400 }
      );
    }
    
    const group = await prisma.wishlistGroup.create({
      data: {
        userId,
        name: name.trim(),
      },
      include: {
        items: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      group,
    });
  } catch (error: any) {
    console.error('Failed to create wishlist group:', error);
    
    // Handle unique constraint violation (duplicate group name for user)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'A collection with this name already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create wishlist group' },
      { status: 500 }
    );
  }
}
