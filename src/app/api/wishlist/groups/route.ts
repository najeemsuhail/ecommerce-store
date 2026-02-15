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
          name: 'My Wishlist',
        },
        include: {
          items: true,
        },
      });
      groups = [defaultGroup];
      console.log(`Created default wishlist group for user ${userId}`);
    }

    console.log(`Found ${groups.length} wishlist groups for user ${userId}`);
    groups.forEach(g => console.log(`Group "${g.name}" has ${g.items.length} items`));

    // Fetch product details for all items
    const groupsWithProducts = await Promise.all(
      groups.map(async (group) => {
        const itemsWithProducts = await Promise.all(
          group.items.map(async (item) => {
            const product = await prisma.product.findUnique({
              where: { id: item.productId },
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
                slug: true,
              },
            });
            
            if (!product) {
              console.warn(`Product not found for ID: ${item.productId}`);
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
        );
        return {
          ...group,
          items: itemsWithProducts.filter((item) => item !== null),
        };
      })
    );

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
