import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isAdmin } from '@/lib/adminAuth';

export async function GET(request: NextRequest) {
  try {
    const admin = await isAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const settings = await prisma.storeSettings.findFirst({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        storeName: true,
        domain: true,
        logoUrl: true,
        seoTitle: true,
        seoDescription: true,
        footerDescription: true,
        themeKey: true,
        codEnabled: true,
        contactEmail: true,
        contactPhone: true,
      },
    });

    if (!settings) {
      return NextResponse.json(
        { success: false, error: 'Store settings not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Error fetching admin store settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch store settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await isAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const {
      storeName,
      domain,
      logoUrl,
      seoTitle,
      seoDescription,
      footerDescription,
      contactEmail,
      contactPhone,
      themeKey,
      codEnabled,
    } = await request.json();

    if (typeof codEnabled !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'codEnabled must be a boolean' },
        { status: 400 }
      );
    }

    const allowedThemes = ['default', 'minimal', 'modern', 'green'];
    if (typeof themeKey !== 'string' || !allowedThemes.includes(themeKey)) {
      return NextResponse.json(
        { success: false, error: 'Invalid theme selected' },
        { status: 400 }
      );
    }

    const existingSettings = await prisma.storeSettings.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });

    if (!existingSettings) {
      return NextResponse.json(
        { success: false, error: 'Store settings not found' },
        { status: 404 }
      );
    }

    const settings = await prisma.storeSettings.update({
      where: { id: existingSettings.id },
      data: {
        storeName: typeof storeName === 'string' ? storeName.trim() : '',
        domain: typeof domain === 'string' && domain.trim() ? domain.trim() : null,
        logoUrl: typeof logoUrl === 'string' && logoUrl.trim() ? logoUrl.trim() : null,
        seoTitle: typeof seoTitle === 'string' && seoTitle.trim() ? seoTitle.trim() : null,
        seoDescription:
          typeof seoDescription === 'string' && seoDescription.trim() ? seoDescription.trim() : null,
        footerDescription:
          typeof footerDescription === 'string' && footerDescription.trim() ? footerDescription.trim() : null,
        contactEmail:
          typeof contactEmail === 'string' && contactEmail.trim() ? contactEmail.trim() : null,
        contactPhone:
          typeof contactPhone === 'string' && contactPhone.trim() ? contactPhone.trim() : null,
        themeKey,
        codEnabled,
      },
      select: {
        id: true,
        storeName: true,
        domain: true,
        logoUrl: true,
        seoTitle: true,
        seoDescription: true,
        footerDescription: true,
        themeKey: true,
        codEnabled: true,
        contactEmail: true,
        contactPhone: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Store settings updated successfully',
      settings,
    });
  } catch (error) {
    console.error('Error updating admin store settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update store settings' },
      { status: 500 }
    );
  }
}
