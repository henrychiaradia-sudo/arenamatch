'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const href = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-center gap-3 pt-2">
      {currentPage > 1 ? (
        <Button asChild variant="outline" size="sm">
          <Link href={href(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <ChevronLeft className="h-4 w-4" /> Anterior
        </Button>
      )}

      <span className="text-sm text-muted-foreground">
        Página {currentPage} de {totalPages}
      </span>

      {currentPage < totalPages ? (
        <Button asChild variant="outline" size="sm">
          <Link href={href(currentPage + 1)}>
            Próxima <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Próxima <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
