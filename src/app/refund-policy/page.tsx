import LegalContentPage from '@/components/LegalContentPage';
import { getLegalPageContent } from '@/lib/contentPages';

export default async function RefundPolicy() {
  const content = await getLegalPageContent('refund-policy');
  return <LegalContentPage content={content} />;
}
