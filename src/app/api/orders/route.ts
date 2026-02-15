import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { extractToken, verifyToken } from '@/lib/auth';
import { calculateShippingCost } from '@/lib/shipping';
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from '@/lib/emailService';

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
      couponCode,
      discount,
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

    // Fetch products and variants together
    const productIds = items.map((item: any) => item.productId) as string[];
    const uniqueProductIds: string[] = Array.from(new Set(productIds)); // Remove duplicates
    
    console.log('Order items:', items);
    console.log('Unique product IDs:', uniqueProductIds);
    
    const products = await prisma.product.findMany({
      where: {
        id: { in: uniqueProductIds },
      },
      include: {
        variants: true,
      },
    });

    console.log('Found products:', products.length, 'Expected:', uniqueProductIds.length);
    console.log('Product IDs found:', products.map(p => p.id));

    // Check if all products were found
    const foundProductIds = products.map((p) => p.id);
    const missingProductIds = uniqueProductIds.filter((id) => !foundProductIds.includes(id));
    
    if (missingProductIds.length > 0) {
      console.error('Missing products:', missingProductIds);
      return NextResponse.json(
        { success: false, error: 'Some products are not available' },
        { status: 400 }
      );
    }

    // Check if products are active
    const inactiveProducts = products.filter((p) => !p.isActive);
    if (inactiveProducts.length > 0) {
      console.error('Inactive products:', inactiveProducts.map(p => p.name));
      return NextResponse.json(
        { success: false, error: 'Some products are no longer available' },
        { status: 400 }
      );
    }

    // Check stock for physical products and variants
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        console.error('Product not found for item:', item);
        continue;
      }

      // If item has a variant, check variant stock
      if (item.variantId) {
        const variant = product.variants.find((v: any) => v.id === item.variantId);
        if (!variant) {
          console.error('Variant not found:', item.variantId, 'for product:', item.productId);
          return NextResponse.json(
            { success: false, error: 'Selected variant is not available' },
            { status: 400 }
          );
        }
        if (!product.isDigital && variant.stock < item.quantity) {
          return NextResponse.json(
            { success: false, error: `Insufficient stock for ${product.name} - ${variant.name}` },
            { status: 400 }
          );
        }
      } else {
        // Check product stock if no variant
        if (!product.isDigital && product.trackInventory) {
          if (!product.stock || product.stock < item.quantity) {
            return NextResponse.json(
              { success: false, error: `Insufficient stock for ${product.name}` },
              { status: 400 }
            );
          }
        }
      }
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = items.map((item: any) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error('Product not found');

      let itemPrice = product.price;
      
      // Use variant price if variant is selected
      if (item.variantId) {
        const variant = product.variants.find((v: any) => v.id === item.variantId);
        if (variant) {
          itemPrice = variant.price;
        }
      }

      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;

      return {
        productId: product.id,
        variantId: item.variantId || null,
        quantity: item.quantity,
        price: itemPrice,
      };
    });

    // Calculate shipping based on order total
    const hasPhysicalProducts = products.some((p) => !p.isDigital);
    const shippingCost = calculateShippingCost(subtotal, hasPhysicalProducts);

    const discountAmount = discount || 0;
    const total = subtotal + shippingCost - discountAmount;

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: decoded?.userId || null,
        guestEmail: guestEmail || null,
        guestName: guestName || null,
        status: 'pending',
        subtotal,
        discountAmount,
        appliedCouponCode: couponCode || null,
        total,
        shippingCost,
        shippingAddress,
        billingAddress: billingSameAsShipping ? shippingAddress : billingAddress,
        billingSameAsShipping: billingSameAsShipping || false,
        paymentMethod: body.paymentMethod || 'razorpay', 
        paymentStatus: body.paymentMethod === 'cod' ? 'cod_pending' : 'pending',

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

    // Track coupon usage if a coupon was applied
    if (body.couponId && couponCode) {
      try {
        await prisma.couponUsage.create({
          data: {
            couponId: body.couponId,
            orderId: order.id,
            userId: decoded?.userId || null,
            guestEmail: guestEmail || null,
            discount: discountAmount,
          },
        });
      } catch (error) {
        console.error('Error tracking coupon usage:', error);
        // Continue even if tracking fails - the order is already created
      }
    }

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

    // Send order confirmation emails for COD orders
    if (body.paymentMethod === 'cod') {
      // Fetch full order details with user for email
      const fullOrder = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (fullOrder) {
        sendOrderConfirmationEmail(fullOrder).catch((err) =>
          console.error('Failed to send COD order confirmation email:', err)
        );
        sendAdminNewOrderEmail(fullOrder).catch((err) =>
          console.error('Failed to send admin COD order notification email:', err)
        );
      }
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