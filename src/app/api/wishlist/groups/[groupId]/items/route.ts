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

// POST add an item to a wishlist group
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const userId = await getUser(request);
    const { groupId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { productId } = await request.json();
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    // Verify the group belongs to the user
    const group = await prisma.wishlistGroup.findUnique({
      where: { id: groupId },
    });
    
    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Group not found' },
        { status: 404 }
      );
    }
    
    if (group.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Add item to group
    const item = await prisma.wishlistItem.create({
      data: {
        groupId,
        productId,
      },
    });
    
    return NextResponse.json({
      success: true,
      item,
    });
  } catch (error: any) {
    console.error('Failed to add item to wishlist:', error);
    
    // Handle unique constraint violation (item already in group)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Item already in this collection' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to add item to wishlist' },
      { status: 500 }
    );
  }
}

// DELETE remove an item from a wishlist group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const userId = await getUser(request);
    const { groupId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { productId } = await request.json();
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    // Verify the group belongs to the user
    const group = await prisma.wishlistGroup.findUnique({
      where: { id: groupId },
    });
    
    if (!group) {
      return NextResponse.json(
        { success: false, error: 'Group not found' },
        { status: 404 }
      );
    }
    
    if (group.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Remove item from group
    await prisma.wishlistItem.deleteMany({
      where: {
        groupId,
        productId,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Item removed from wishlist',
    });
  } catch (error) {
    console.error('Failed to remove item from wishlist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove item from wishlist' },
      { status: 500 }
    );
  }
}
