import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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
      storeAbbreviation,
      domain,
      logoUrl,
      seoTitle,
      seoDescription,
      footerDescription,
      contactEmail,
      contactPhone,
      themeKey,
      codEnabled,
      homeBestSellerProductIds,
      homeTrendingProductIds,
      heroSlides,
      landingPage,
      socialLinks,
      footerHighlights,
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

    if (heroSlides !== undefined && !Array.isArray(heroSlides)) {
      return NextResponse.json(
        { success: false, error: 'heroSlides must be an array' },
        { status: 400 }
      );
    }

    if (socialLinks !== undefined && !Array.isArray(socialLinks)) {
      return NextResponse.json(
        { success: false, error: 'socialLinks must be an array' },
        { status: 400 }
      );
    }

    if (
      landingPage !== undefined &&
      (typeof landingPage !== 'object' || landingPage === null || Array.isArray(landingPage))
    ) {
      return NextResponse.json(
        { success: false, error: 'landingPage must be an object' },
        { status: 400 }
      );
    }

    if (footerHighlights !== undefined && !Array.isArray(footerHighlights)) {
      return NextResponse.json(
        { success: false, error: 'footerHighlights must be an array' },
        { status: 400 }
      );
    }

    if (
      storeAbbreviation !== undefined &&
      typeof storeAbbreviation !== 'string'
    ) {
      return NextResponse.json(
        { success: false, error: 'storeAbbreviation must be a string' },
        { status: 400 }
      );
    }

    const normalizedStoreAbbreviation =
      typeof storeAbbreviation === 'string'
        ? storeAbbreviation.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
        : '';

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
        storeAbbreviation: normalizedStoreAbbreviation || null,
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
        homeBestSellerProductIds: Array.isArray(homeBestSellerProductIds)
          ? homeBestSellerProductIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
          : [],
        homeTrendingProductIds: Array.isArray(homeTrendingProductIds)
          ? homeTrendingProductIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
          : [],
        heroSlides: Array.isArray(heroSlides) ? heroSlides : [],
        landingPage:
          landingPage && typeof landingPage === 'object' && !Array.isArray(landingPage) ? landingPage : {},
        socialLinks: Array.isArray(socialLinks) ? socialLinks : [],
        footerHighlights: Array.isArray(footerHighlights) ? footerHighlights : [],
      } as Record<string, unknown>,
    });

    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/landing');
    revalidatePath('/admin/settings');

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
