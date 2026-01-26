import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');

    let attributes;
    if (categoryId) {
      attributes = await prisma.attribute.findMany({
        where: { categoryId },
        orderBy: { name: 'asc' }
      });
    } else {
      attributes = await prisma.attribute.findMany({
        orderBy: { name: 'asc' }
      });
    }

    return NextResponse.json(attributes);
  } catch (error) {
    console.error('Error fetching attributes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attributes' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { categoryId, name, slug, type, required, filterable, searchable, options } = await req.json();

    if (!categoryId || !name || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const attribute = await prisma.attribute.create({
      data: {
        categoryId,
        name,
        slug,
        type: type || 'text',
        required: required || false,
        filterable: filterable !== false,
        searchable: searchable || false,
        options: options || []
      }
    });

    return NextResponse.json(attribute, { status: 201 });
  } catch (error: any) {
    console.error('Error creating attribute:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Attribute slug already exists for this category' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create attribute' },
      { status: 500 }
    );
  }
}
