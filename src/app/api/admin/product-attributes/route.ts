import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    let values;
    if (productId) {
      values = await prisma.productAttributeValue.findMany({
        where: { productId },
        include: { attribute: true }
      });
    } else {
      values = await prisma.productAttributeValue.findMany({
        include: { attribute: true }
      });
    }

    return NextResponse.json(values);
  } catch (error) {
    console.error('Error fetching attribute values:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attribute values' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { productId, attributeId, value } = await req.json();

    if (!productId || !attributeId || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upsert to handle updates
    const attributeValue = await prisma.productAttributeValue.upsert({
      where: {
        productId_attributeId: {
          productId,
          attributeId
        }
      },
      update: { value },
      create: {
        productId,
        attributeId,
        value
      }
    });

    return NextResponse.json(attributeValue, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating attribute value:', error);
    return NextResponse.json(
      { error: 'Failed to save attribute value' },
      { status: 500 }
    );
  }
}
