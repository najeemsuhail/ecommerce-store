import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAdmin } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const admin = await isAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get statistics
    const [
      totalOrders,
      totalRevenue,
      totalProducts,
      totalUsers,
      recentOrders,
      topProducts,
      ordersByStatus,
    ] = await Promise.all([
      // Total orders
      prisma.order.count(),

      // Total revenue (only paid orders)
      prisma.order.aggregate({
        where: { paymentStatus: 'paid' },
        _sum: { total: true },
      }),

      // Total products
      prisma.product.count(),

      // Total users
      prisma.user.count(),

      // Recent orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true },
          },
          items: {
            include: {
              product: {
                select: { name: true },
              },
            },
          },
        },
      }),

      // Top selling products
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),

      // Orders by status
      prisma.order.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    // Get product details for top products
    const topProductIds = topProducts.map((p) => p.productId);
    const productDetails = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true, price: true, images: true },
    });

    const topProductsWithDetails = topProducts.map((tp) => {
      const product = productDetails.find((p) => p.id === tp.productId);
      return {
        ...product,
        totalSold: tp._sum.quantity,
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalProducts,
        totalUsers,
        recentOrders,
        topProducts: topProductsWithDetails,
        ordersByStatus,
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}