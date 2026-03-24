import LegalContentPage from '@/components/LegalContentPage';
import { getLegalPageContent } from '@/lib/contentPages';

export default async function PrivacyPolicy() {
  const content = await getLegalPageContent('privacy-policy');
  return <LegalContentPage content={content} />;
}
