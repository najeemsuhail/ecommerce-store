import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { extractToken, verifyToken } from '@/lib/auth';

// GET all orders (for logged-in user)
export async function GET(request: NextRequest) {
  try {
    // Get token (optional - can view orders as guest with email)
    const authHeader = request.headers.get('Authorization');
    const token = extractToken(authHeader);
    const decoded = token ? verifyToken(token) : null;

    const searchParams = request.nextUrl.searchParams;
    const guestEmail = searchParams.get('guestEmail');

    let orders;

    if (decoded) {
      // Logged-in user - get their orders
      orders = await prisma.order.findMany({
        where: { userId: decoded.userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  images: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (guestEmail) {
      // Guest user - get orders by email
      orders = await prisma.order.findMany({
        where: { guestEmail },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  images: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Authentication required or provide guest email' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      orders,
      count: orders.length,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items, // [{ productId, quantity }]
      shippingAddress,
      billingAddress,
      billingSameAsShipping,
      guestEmail,
      guestName,
      notes,
    } = body;

    // Get user if authenticated
    const authHeader = request.headers.get('Authorization');
    const token = extractToken(authHeader);
    const decoded = token ? verifyToken(token) : null;

    // Validation
    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    if (!decoded && !guestEmail) {
      return NextResponse.json(
        { success: false, error: 'Email is required for guest checkout' },
        { status: 400 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { success: false, error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    // Fetch products and calculate total
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { success: false, error: 'Some products are not available' },
        { status: 400 }
      );
    }

    // Check stock for physical products
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;

      if (!product.isDigital && product.trackInventory) {
        if (!product.stock || product.stock < item.quantity) {
          return NextResponse.json(
            { success: false, error: `Insufficient stock for ${product.name}` },
            { status: 400 }
          );
        }
      }
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = items.map((item: any) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error('Product not found');

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      };
    });

    // Calculate shipping (simple logic - can be enhanced)
    const hasPhysicalProducts = products.some((p) => !p.isDigital);
    const shippingCost = hasPhysicalProducts ? 15.0 : 0; // Flat $15 shipping

    const total = subtotal + shippingCost;

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: decoded?.userId || null,
        guestEmail: guestEmail || null,
        guestName: guestName || null,
        status: 'pending',
        total,
        shippingCost,
        shippingAddress,
        billingAddress: billingSameAsShipping ? shippingAddress : billingAddress,
        billingSameAsShipping: billingSameAsShipping || false,
        paymentStatus: 'pending',
        notes,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Reduce stock for physical products
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || product.isDigital || !product.trackInventory) continue;

      await prisma.product.update({
        where: { id: product.id },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Order created successfully',
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}