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

// DELETE a wishlist group
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
    
    await prisma.wishlistGroup.delete({
      where: { id: groupId },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Group deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete wishlist group:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete wishlist group' },
      { status: 500 }
    );
  }
}

// PATCH update a wishlist group name
export async function PATCH(
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
    
    const { name } = await request.json();
    
    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Group name is required' },
        { status: 400 }
      );
    }
    
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
    
    const updatedGroup = await prisma.wishlistGroup.update({
      where: { id: groupId },
      data: { name: name.trim() },
      include: {
        items: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      group: updatedGroup,
    });
  } catch (error: any) {
    console.error('Failed to update wishlist group:', error);
    
    // Handle unique constraint violation (duplicate group name for user)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'A collection with this name already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update wishlist group' },
      { status: 500 }
    );
  }
}
