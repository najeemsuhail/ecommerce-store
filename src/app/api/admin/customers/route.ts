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

    // Get query parameters for pagination and search
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build search filter
    const searchFilter = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    const [totalCount, customers] = await Promise.all([
      prisma.user.count({
        where: searchFilter,
      }),
      prisma.user.findMany({
        where: searchFilter,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              orders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const customerIds = customers.map((customer) => customer.id);
    const orderValueRows =
      customerIds.length > 0
        ? await prisma.order.groupBy({
            by: ['userId'],
            where: {
              userId: {
                in: customerIds,
              },
            },
            _sum: { total: true },
          })
        : [];

    const orderValueByUserId = new Map(
      orderValueRows
        .filter((row) => row.userId)
        .map((row) => [row.userId as string, row._sum.total || 0])
    );

    const customersWithStats = customers.map((customer) => ({
      ...customer,
      totalOrderValue: orderValueByUserId.get(customer.id) || 0,
      totalOrders: customer._count.orders,
    }));

    return NextResponse.json({
      success: true,
      data: customersWithStats,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}
