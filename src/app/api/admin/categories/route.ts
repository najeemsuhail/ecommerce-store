import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true,
        imageUrl: true,
        children: {
          select: {
            id: true,
          },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, slug, parentId, imageUrl } = await req.json();

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check for duplicate name at the same hierarchy level
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        parentId: parentId || null
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists at this level' },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        parentId: parentId || null,
        imageUrl: imageUrl || null,
      },
      include: {
        parent: true,
        children: true
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating category:', error);
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { error: 'Category slug already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
