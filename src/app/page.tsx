import type { Metadata } from 'next';
import { getStoreSettings } from '@/lib/storeSettings';
import HomePageContent from './HomePageContent';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const title = settings.seoTitle || settings.storeName;
  const description = settings.seoDescription || `Shop ${settings.storeName} online.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: '/',
      siteName: settings.storeName,
    },
  };
}

export default async function HomePage() {
  await getStoreSettings();

  return <HomePageContent />;
}
