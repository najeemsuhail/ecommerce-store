import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET autocomplete suggestions for product search (products + categories + tags)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '8');

    if (!query || query.trim().length < 1) {
      return NextResponse.json({
        success: true,
        products: [],
        categories: [],
        tags: [],
      });
    }

    const searchQuery = query.trim();

    // Search products
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } },
          { brand: { contains: searchQuery, mode: 'insensitive' } },
          { tags: { has: searchQuery } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: true,
        brand: true,
      },
      take: Math.min(limit, 5), // Limit products to make room for categories
    });

    // Search categories
    const categories = await prisma.category.findMany({
      where: {
        name: { contains: searchQuery, mode: 'insensitive' },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { products: true },
        },
      },
      take: 3,
    });

    // Get unique tags from products that match the query
    const tagsResult = await prisma.product.findMany({
      where: {
        isActive: true,
        tags: {
          hasSome: [searchQuery],
        },
      },
      select: {
        tags: true,
      },
      take: 20,
    });

    // Extract and deduplicate tags
    const tagsSet = new Set<string>();
    tagsResult.forEach((product) => {
      product.tags.forEach((tag) => {
        if (tag.toLowerCase().includes(searchQuery.toLowerCase())) {
          tagsSet.add(tag);
        }
      });
    });
    const tags = Array.from(tagsSet).slice(0, 2);

    // Format product suggestions
    const productSuggestions = products.map((product) => ({
      type: 'product',
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : null,
      brand: product.brand,
    }));

    // Format category suggestions
    const categorySuggestions = categories.map((category) => ({
      type: 'category',
      id: category.id,
      name: category.name,
      slug: category.slug,
      productCount: category._count.products,
    }));

    // Format tag suggestions
    const tagSuggestions = tags.map((tag) => ({
      type: 'tag',
      name: tag,
    }));

    return NextResponse.json({
      success: true,
      products: productSuggestions,
      categories: categorySuggestions,
      tags: tagSuggestions,
      totalResults: productSuggestions.length + categorySuggestions.length + tagSuggestions.length,
    });
  } catch (error) {
    console.error('Error fetching autocomplete suggestions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
