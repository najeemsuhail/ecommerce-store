import type { Metadata } from 'next';
import ComingSoonClient from '@/components/ComingSoonClient';
import { getStoreSettings } from '@/lib/storeSettings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const title = `${settings.storeName} | Coming Soon`;
  const description =
    settings.seoDescription || `${settings.storeName} is coming soon. Join the waitlist for launch updates.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: '/coming-soon',
      siteName: settings.storeName,
    },
  };
}

export default async function ComingSoonPage() {
  const settings = await getStoreSettings();

  return <ComingSoonClient settings={settings} />;
}
