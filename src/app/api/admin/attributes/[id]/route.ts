import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const attribute = await prisma.attribute.findUnique({
      where: { id },
      include: { values: true }
    });

    if (!attribute) {
      return NextResponse.json(
        { error: 'Attribute not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(attribute);
  } catch (error) {
    console.error('Error fetching attribute:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attribute' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, slug, type, required, filterable, searchable, options } = await req.json();

    const attribute = await prisma.attribute.update({
      where: { id },
      data: {
        name,
        slug,
        type,
        required,
        filterable,
        searchable,
        options
      }
    });

    return NextResponse.json(attribute);
  } catch (error: any) {
    console.error('Error updating attribute:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Attribute not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update attribute' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.attribute.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Attribute deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting attribute:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Attribute not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete attribute' },
      { status: 500 }
    );
  }
}
