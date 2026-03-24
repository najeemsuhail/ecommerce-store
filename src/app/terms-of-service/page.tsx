import LegalContentPage from '@/components/LegalContentPage';
import { getLegalPageContent } from '@/lib/contentPages';

export default async function TermsOfService() {
  const content = await getLegalPageContent('terms-of-service');
  return <LegalContentPage content={content} />;
}
