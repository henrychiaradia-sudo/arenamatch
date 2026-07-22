import { requireAdmin } from '@/lib/auth/session';
import { PlaceholderPage, titleFromSlug } from '@/components/shared/placeholder-page';

export default async function AdminPlaceholder({ params }: { params: { slug?: string[] } }) {
  await requireAdmin();
  return <PlaceholderPage title={titleFromSlug(params.slug)} />;
}
