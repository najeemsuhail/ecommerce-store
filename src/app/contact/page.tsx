import ContactPageClient from './ContactPageClient';
import { getContactPageContent } from '@/lib/contentPages';

export default async function ContactPage() {
  const content = await getContactPageContent();
  return <ContactPageClient content={content} />;
}
