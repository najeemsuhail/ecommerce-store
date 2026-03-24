import { cache } from 'react';
import prisma from '@/lib/prisma';

export interface StoreHeroSlide {
  id: number;
  badge: string;
  badgeEmoji: string;
  category: string;
  mainHeading: string;
  subHeading: string;
  description: string;
  primaryCTA: {
    label: string;
    href: string;
  };
  secondaryCTA: {
    label: string;
    href: string;
  };
  image: {
    src: string;
    alt: string;
  };
}

export interface StoreSocialLink {
  platform: string;
  url: string;
  label: string;
}

export interface StoreHighlight {
  icon: string;
  title: string;
  description: string;
}

export interface PublicStoreSettings {
  storeName: string;
  domain: string | null;
  logoUrl: string;
  seoTitle: string;
  seoDescription: string;
  footerDescription: string;
  contactEmail: string | null;
  contactPhone: string | null;
  themeKey: string;
  heroSlides: StoreHeroSlide[];
  socialLinks: StoreSocialLink[];
  footerHighlights: StoreHighlight[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseHeroSlides(value: unknown): StoreHeroSlide[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((slide, index) => {
      const primaryCTA = isRecord(slide.primaryCTA) ? slide.primaryCTA : {};
      const secondaryCTA = isRecord(slide.secondaryCTA) ? slide.secondaryCTA : {};
      const image = isRecord(slide.image) ? slide.image : {};

      return {
        id: Number(slide.id) || index + 1,
        badge: typeof slide.badge === 'string' ? slide.badge : '',
        badgeEmoji: typeof slide.badgeEmoji === 'string' ? slide.badgeEmoji : '',
        category: typeof slide.category === 'string' ? slide.category : '',
        mainHeading: typeof slide.mainHeading === 'string' ? slide.mainHeading : '',
        subHeading: typeof slide.subHeading === 'string' ? slide.subHeading : '',
        description: typeof slide.description === 'string' ? slide.description : '',
        primaryCTA: {
          label: typeof primaryCTA.label === 'string' ? primaryCTA.label : '',
          href: typeof primaryCTA.href === 'string' ? primaryCTA.href : '',
        },
        secondaryCTA: {
          label: typeof secondaryCTA.label === 'string' ? secondaryCTA.label : '',
          href: typeof secondaryCTA.href === 'string' ? secondaryCTA.href : '',
        },
        image: {
          src: typeof image.src === 'string' ? image.src : '',
          alt: typeof image.alt === 'string' ? image.alt : '',
        },
      };
    })
    .filter(
      (slide) =>
        slide.mainHeading &&
        slide.subHeading &&
        slide.primaryCTA.label &&
        slide.primaryCTA.href &&
        slide.image.src &&
        slide.image.alt
    );
}

function parseSocialLinks(value: unknown): StoreSocialLink[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((link) => ({
      platform: typeof link.platform === 'string' ? link.platform : '',
      url: typeof link.url === 'string' ? link.url : '',
      label: typeof link.label === 'string' ? link.label : '',
    }))
    .filter((link) => link.platform && link.url && link.label);
}

function parseFooterHighlights(value: unknown): StoreHighlight[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((highlight) => ({
      icon: typeof highlight.icon === 'string' ? highlight.icon : '',
      title: typeof highlight.title === 'string' ? highlight.title : '',
      description: typeof highlight.description === 'string' ? highlight.description : '',
    }))
    .filter((highlight) => highlight.icon && highlight.title && highlight.description);
}

function mapSettings(settings: Record<string, unknown>): PublicStoreSettings {
  return {
    storeName: typeof settings.storeName === 'string' && settings.storeName.trim() ? settings.storeName : '',
    domain: typeof settings.domain === 'string' && settings.domain.trim() ? settings.domain : null,
    logoUrl: typeof settings.logoUrl === 'string' && settings.logoUrl.trim() ? settings.logoUrl : '',
    seoTitle: typeof settings.seoTitle === 'string' && settings.seoTitle.trim() ? settings.seoTitle : '',
    seoDescription:
      typeof settings.seoDescription === 'string' && settings.seoDescription.trim() ? settings.seoDescription : '',
    footerDescription:
      typeof settings.footerDescription === 'string' && settings.footerDescription.trim()
        ? settings.footerDescription
        : '',
    contactEmail:
      typeof settings.contactEmail === 'string' && settings.contactEmail.trim() ? settings.contactEmail : null,
    contactPhone:
      typeof settings.contactPhone === 'string' && settings.contactPhone.trim() ? settings.contactPhone : null,
    themeKey: typeof settings.themeKey === 'string' && settings.themeKey.trim() ? settings.themeKey : '',
    heroSlides: parseHeroSlides(settings.heroSlides),
    socialLinks: parseSocialLinks(settings.socialLinks),
    footerHighlights: parseFooterHighlights(settings.footerHighlights),
  };
}

export const getStoreSettings = cache(async (): Promise<PublicStoreSettings> => {
  const settings = await prisma.storeSettings.findFirst({
    orderBy: {
      createdAt: 'asc',
    },
  });

  if (!settings) {
    throw new Error('StoreSettings row not found. Insert a row into the StoreSettings table before loading the app.');
  }

  return mapSettings(settings as Record<string, unknown>);
});
