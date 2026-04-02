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

export interface StoreLandingLink {
  label: string;
  href: string;
}

export interface StoreLandingFeature {
  title: string;
  description: string;
}

export interface StoreLandingStep extends StoreLandingLink {
  title: string;
  description: string;
}

export interface StoreLandingPromoCard extends StoreLandingLink {
  eyebrow: string;
  title: string;
  description: string;
}

export interface StoreHomeFeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface StoreHomeFeaturesSection {
  title: string;
  description: string;
  items: StoreHomeFeatureItem[];
}

export interface StoreLandingPage {
  badge: string;
  title: string;
  description: string;
  primaryCTA: StoreLandingLink;
  secondaryCTA: StoreLandingLink;
  audiencePillars: StoreLandingFeature[];
  steps: StoreLandingStep[];
  promoCards: StoreLandingPromoCard[];
}

export interface PublicStoreSettings {
  storeName: string;
  storeAbbreviation: string | null;
  domain: string | null;
  logoUrl: string;
  seoTitle: string;
  seoDescription: string;
  footerDescription: string;
  contactEmail: string | null;
  contactPhone: string | null;
  codEnabled: boolean;
  homeBestSellerProductIds: string[];
  homeTrendingProductIds: string[];
  themeKey: string;
  heroSlides: StoreHeroSlide[];
  homeFeatures: StoreHomeFeaturesSection;
  landingPage: StoreLandingPage;
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

function parseLandingLink(value: unknown): StoreLandingLink {
  const record = isRecord(value) ? value : {};

  return {
    label: typeof record.label === 'string' ? record.label : '',
    href: typeof record.href === 'string' ? record.href : '',
  };
}

function parseHomeFeatures(value: unknown): StoreHomeFeaturesSection {
  const record = isRecord(value) ? value : {};

  const items = Array.isArray(record.items)
    ? record.items
        .filter(isRecord)
        .map((item) => ({
          icon: typeof item.icon === 'string' ? item.icon : '',
          title: typeof item.title === 'string' ? item.title : '',
          description: typeof item.description === 'string' ? item.description : '',
        }))
        .filter((item) => item.icon && item.title && item.description)
    : [];

  return {
    title:
      typeof record.title === 'string' && record.title.trim()
        ? record.title
        : 'Why Shoppers Choose Us',
    description:
      typeof record.description === 'string' && record.description.trim()
        ? record.description
        : 'Reliable service, secure checkout, and everyday convenience built into every order.',
    items:
      items.length > 0
        ? items
        : [
            {
              icon: 'BOX',
              title: 'Free Shipping',
              description: 'On orders over Rs.1000',
            },
            {
              icon: 'LOCK',
              title: 'Secure Payment',
              description: '100% secure transactions',
            },
            {
              icon: 'EASY',
              title: 'Easy Returns',
              description: '48 hours guarantee',
            },
          ],
  };
}

function parseLandingPage(value: unknown, storeName: string): StoreLandingPage {
  const record = isRecord(value) ? value : {};

  const audiencePillars = Array.isArray(record.audiencePillars)
    ? record.audiencePillars
        .filter(isRecord)
        .map((item) => ({
          title: typeof item.title === 'string' ? item.title : '',
          description: typeof item.description === 'string' ? item.description : '',
        }))
        .filter((item) => item.title && item.description)
    : [];

  const steps = Array.isArray(record.steps)
    ? record.steps
        .filter(isRecord)
        .map((item) => ({
          title: typeof item.title === 'string' ? item.title : '',
          description: typeof item.description === 'string' ? item.description : '',
          label: typeof item.label === 'string' ? item.label : '',
          href: typeof item.href === 'string' ? item.href : '',
        }))
        .filter((item) => item.title && item.description && item.label && item.href)
    : [];

  const promoCards = Array.isArray(record.promoCards)
    ? record.promoCards
        .filter(isRecord)
        .map((item) => ({
          eyebrow: typeof item.eyebrow === 'string' ? item.eyebrow : '',
          title: typeof item.title === 'string' ? item.title : '',
          description: typeof item.description === 'string' ? item.description : '',
          label: typeof item.label === 'string' ? item.label : '',
          href: typeof item.href === 'string' ? item.href : '',
        }))
        .filter((item) => item.eyebrow && item.title && item.description && item.label && item.href)
    : [];

  return {
    badge: typeof record.badge === 'string' && record.badge.trim() ? record.badge : storeName,
    title:
      typeof record.title === 'string' && record.title.trim()
        ? record.title
        : 'A dedicated landing page for campaigns, launches, and paid traffic.',
    description:
      typeof record.description === 'string' && record.description.trim()
        ? record.description
        : `This route gives you a focused entry point outside the main storefront home page for ${storeName}.`,
    primaryCTA: (() => {
      const link = parseLandingLink(record.primaryCTA);
      return link.label && link.href ? link : { label: 'Shop Products', href: '/products' };
    })(),
    secondaryCTA: (() => {
      const link = parseLandingLink(record.secondaryCTA);
      return link.label && link.href ? link : { label: 'Talk to Us', href: '/contact' };
    })(),
    audiencePillars:
      audiencePillars.length > 0
        ? audiencePillars
        : [
            {
              title: 'Curated Picks',
              description: 'Skip the clutter and shop from collections built to convert browsing into confident buying.',
            },
            {
              title: 'Fast Support',
              description: 'Get clear help before and after checkout through the channels your customers already use.',
            },
            {
              title: 'Flexible Checkout',
              description: 'Move from discovery to payment with a simple storefront flow built for mobile-first shoppers.',
            },
          ],
    steps:
      steps.length > 0
        ? steps
        : [
            {
              title: 'Explore Collections',
              description: 'Browse categories and featured products without jumping through multiple menus.',
              href: '/categories',
              label: 'View Categories',
            },
            {
              title: 'Find the Right Product',
              description: 'Compare new arrivals, featured items, and best-value picks in one storefront.',
              href: '/products',
              label: 'Browse Products',
            },
            {
              title: 'Place the Order',
              description: 'Complete checkout quickly with a cleaner path from product page to confirmation.',
              href: '/checkout-flow',
              label: 'Start Checkout',
            },
          ],
    promoCards:
      promoCards.length > 0
        ? promoCards
        : [
            {
              eyebrow: 'Featured',
              title: 'Show premium picks',
              description: 'Point traffic straight at your highest-converting or highest-margin products.',
              href: '/products?isFeatured=true',
              label: 'Open Featured',
            },
            {
              eyebrow: 'Collections',
              title: 'Group by intent',
              description: 'Use category-led navigation when visitors arrive for a specific theme or use case.',
              href: '/categories',
              label: 'Browse Collections',
            },
            {
              eyebrow: 'Content',
              title: 'Support the sale',
              description: 'Pair campaign traffic with helpful articles, guides, and trust-building educational content.',
              href: '/blog',
              label: 'Read the Blog',
            },
          ],
  };
}

function mapSettings(settings: Record<string, unknown>): PublicStoreSettings {
  const storeName = typeof settings.storeName === 'string' && settings.storeName.trim() ? settings.storeName : '';

  return {
    storeName,
    storeAbbreviation:
      typeof settings.storeAbbreviation === 'string' && settings.storeAbbreviation.trim()
        ? settings.storeAbbreviation
        : null,
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
    codEnabled: typeof settings.codEnabled === 'boolean' ? settings.codEnabled : true,
    homeBestSellerProductIds: Array.isArray(settings.homeBestSellerProductIds)
      ? settings.homeBestSellerProductIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
      : [],
    homeTrendingProductIds: Array.isArray(settings.homeTrendingProductIds)
      ? settings.homeTrendingProductIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
      : [],
    themeKey: typeof settings.themeKey === 'string' && settings.themeKey.trim() ? settings.themeKey : '',
    heroSlides: parseHeroSlides(settings.heroSlides),
    homeFeatures: parseHomeFeatures(settings.homeFeatures),
    landingPage: parseLandingPage(settings.landingPage, storeName || 'Your Store'),
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
