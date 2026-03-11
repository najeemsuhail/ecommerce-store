import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { extractToken, verifyToken } from '@/lib/auth';

// Disable caching for this API route
export const revalidate = 0;
export const dynamic = 'force-dynamic';

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

const DEFAULT_WISHLIST_NAME = 'My Wishlist';

function isUniqueConstraintError(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error;
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
    
    let groups = await prisma.wishlistGroup.findMany({
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

    // Create default wishlist group if user has no groups
    if (groups.length === 0) {
      const defaultGroup = await prisma.wishlistGroup.create({
        data: {
          userId,
          name: DEFAULT_WISHLIST_NAME,
        },
        include: {
          items: true,
        },
      });
      groups = [defaultGroup];
      console.log(`Created default wishlist group for user ${userId}`);
    }

    const productIds = Array.from(
      new Set(groups.flatMap((group) => group.items.map((item) => item.productId)))
    );
    const products = productIds.length > 0
      ? await prisma.product.findMany({
          where: {
            id: { in: productIds },
          },
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            slug: true,
          },
        })
      : [];
    const productById = new Map(products.map((product) => [product.id, product]));
    const groupsWithProducts = groups.map((group) => ({
      ...group,
      items: group.items
        .map((item) => {
          const product = productById.get(item.productId);
          if (!product) {
            return null;
          }

          return {
            ...item,
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0],
            slug: product.slug,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
    }));

    return NextResponse.json({
      success: true,
      groups: groupsWithProducts,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
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
  } catch (error: unknown) {
    console.error('Failed to create wishlist group:', error);
    
    // Handle unique constraint violation (duplicate group name for user)
    if (isUniqueConstraintError(error) && error.code === 'P2002') {
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
