import { Construction } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';

/**
 * Página placeholder para seções previstas em fases futuras do roadmap.
 * Evita links quebrados na navegação enquanto o MVP evolui fase a fase.
 */
export function PlaceholderPage({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <EmptyState
        icon={Construction}
        title="Em construção"
        description="Esta seção faz parte das próximas fases do desenvolvimento. A estrutura, o banco de dados e as permissões já estão prontos para recebê-la."
      />
    </div>
  );
}

/** Converte um slug de rota em um título legível. */
export function titleFromSlug(slug: string[] | undefined): string {
  if (!slug || slug.length === 0) return 'Seção';
  const last = slug[slug.length - 1]!;
  return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, ' ');
}
