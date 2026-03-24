import { cache } from 'react';
import prisma from '@/lib/prisma';

type ContentPageRecord = {
  title: string;
  subtitle: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  payload: unknown;
};

export type ContentSection = {
  title: string;
  paragraphs: string[];
  checklist?: string[];
  accent?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
};

export type ContactLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type ContactCard = {
  iconKey: 'email' | 'location' | 'hours';
  title: string;
  lines: string[];
  links?: ContactLink[];
};

export type PageCta = {
  title: string;
  description: string;
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
};

export type AboutPageContent = {
  title: string;
  subtitle: string;
  metaTitle: string | null;
  metaDescription: string | null;
  sections: ContentSection[];
  finalCta: PageCta;
};

export type ContactPageContent = {
  title: string;
  subtitle: string;
  metaTitle: string | null;
  metaDescription: string | null;
  cards: ContactCard[];
  formTitle: string;
  formDescription: string;
  successTitle: string;
  successDescription: string;
  closingTitle: string;
  closingDescription: string;
};

function requireStringField(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`ContentPage is missing required field: ${fieldName}`);
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseParagraphs(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function parseChecklist(value: unknown): string[] | undefined {
  const items = parseParagraphs(value);
  return items.length > 0 ? items : undefined;
}

function parseSections(value: unknown): ContentSection[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((section) => ({
      title: typeof section.title === 'string' ? section.title : '',
      paragraphs: parseParagraphs(section.paragraphs),
      checklist: parseChecklist(section.checklist),
      accent: section.accent === true,
      ctaLabel: typeof section.ctaLabel === 'string' ? section.ctaLabel : undefined,
      ctaHref: typeof section.ctaHref === 'string' ? section.ctaHref : undefined,
    }))
    .filter((section) => section.title && (section.paragraphs.length > 0 || (section.checklist?.length ?? 0) > 0));
}

function parseContactLinks(value: unknown): ContactLink[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const links = value
    .filter(isRecord)
    .map((link) => ({
      label: typeof link.label === 'string' ? link.label : '',
      href: typeof link.href === 'string' ? link.href : '',
      external: link.external === true,
    }))
    .filter((link) => link.label && link.href);

  return links.length > 0 ? links : undefined;
}

function parseCards(value: unknown): ContactCard[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((card) => ({
      iconKey:
        card.iconKey === 'email' || card.iconKey === 'location' || card.iconKey === 'hours'
          ? card.iconKey
          : 'email',
      title: typeof card.title === 'string' ? card.title : '',
      lines: parseParagraphs(card.lines),
      links: parseContactLinks(card.links),
    }))
    .filter((card) => card.title && card.lines.length > 0);
}

function parsePageCta(value: unknown): PageCta | null {
  if (!isRecord(value)) {
    return null;
  }

  const title = typeof value.title === 'string' ? value.title : '';
  const description = typeof value.description === 'string' ? value.description : '';
  const label = typeof value.label === 'string' ? value.label : '';
  const href = typeof value.href === 'string' ? value.href : '';
  const variant = value.variant === 'secondary' ? 'secondary' : 'primary';

  if (!title || !description || !label || !href) {
    return null;
  }

  return { title, description, label, href, variant };
}

const getContentPageRecord = cache(async (slug: string): Promise<ContentPageRecord | null> => {
  const page = await prisma.contentPage.findUnique({
    where: { slug },
  });

  if (!page) {
    return null;
  }

  return {
    title: page.title,
    subtitle: page.subtitle,
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    payload: page.payload,
  };
});

export async function getAboutPageContent(): Promise<AboutPageContent> {
  const page = await getContentPageRecord('about');

  if (!page) {
    throw new Error('ContentPage row not found for slug "about". Insert the row before loading the page.');
  }

  const payload = isRecord(page.payload) ? page.payload : {};
  const sections = parseSections(payload.sections);
  const finalCta = parsePageCta(payload.finalCta);

  if (sections.length === 0) {
    throw new Error('ContentPage "about" is missing valid payload.sections content.');
  }

  if (!finalCta) {
    throw new Error('ContentPage "about" is missing a valid payload.finalCta object.');
  }

  return {
    title: page.title,
    subtitle: page.subtitle ?? '',
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    sections,
    finalCta,
  };
}

export async function getContactPageContent(): Promise<ContactPageContent> {
  const page = await getContentPageRecord('contact');

  if (!page) {
    throw new Error('ContentPage row not found for slug "contact". Insert the row before loading the page.');
  }

  const payload = isRecord(page.payload) ? page.payload : {};
  const cards = parseCards(payload.cards);

  if (cards.length === 0) {
    throw new Error('ContentPage "contact" is missing valid payload.cards content.');
  }

  return {
    title: page.title,
    subtitle: page.subtitle ?? '',
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    cards,
    formTitle: requireStringField(payload.formTitle, 'contact.payload.formTitle'),
    formDescription: requireStringField(payload.formDescription, 'contact.payload.formDescription'),
    successTitle: requireStringField(payload.successTitle, 'contact.payload.successTitle'),
    successDescription: requireStringField(payload.successDescription, 'contact.payload.successDescription'),
    closingTitle: requireStringField(payload.closingTitle, 'contact.payload.closingTitle'),
    closingDescription: requireStringField(payload.closingDescription, 'contact.payload.closingDescription'),
  };
}
