import { PlaceholderPage, titleFromSlug } from '@/components/shared/placeholder-page';

export default function PainelPlaceholder({ params }: { params: { slug?: string[] } }) {
  return <PlaceholderPage title={titleFromSlug(params.slug)} />;
}
