import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SPORTS, BRAZIL_STATES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ExploreFiltersProps {
  action: string;
  showSport?: boolean;
  showState?: boolean;
  statusOptions?: { value: string; label: string }[];
  values?: { q?: string; sport?: string; state?: string; status?: string };
}

const selectClass =
  'h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

/**
 * Barra de filtros baseada em <form method="get"> — funciona sem JavaScript.
 * A filtragem é aplicada no servidor lendo os searchParams.
 */
export function ExploreFilters({
  action,
  showSport,
  showState,
  statusOptions,
  values = {},
}: ExploreFiltersProps) {
  return (
    <form
      method="get"
      action={action}
      className="flex flex-col gap-3 rounded-xl border bg-card p-4 md:flex-row md:items-end"
    >
      <div className="flex-1 space-y-1.5">
        <label htmlFor="q" className="text-xs font-medium text-muted-foreground">
          Buscar
        </label>
        <Input id="q" name="q" placeholder="Nome, palavra-chave..." defaultValue={values.q ?? ''} />
      </div>

      {showSport ? (
        <div className="space-y-1.5">
          <label htmlFor="sport" className="text-xs font-medium text-muted-foreground">
            Modalidade
          </label>
          <select id="sport" name="sport" defaultValue={values.sport ?? ''} className={cn(selectClass, 'w-full md:w-44')}>
            <option value="">Todas</option>
            {SPORTS.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {showState ? (
        <div className="space-y-1.5">
          <label htmlFor="state" className="text-xs font-medium text-muted-foreground">
            Estado
          </label>
          <select id="state" name="state" defaultValue={values.state ?? ''} className={cn(selectClass, 'w-full md:w-32')}>
            <option value="">Todos</option>
            {BRAZIL_STATES.map((s) => (
              <option key={s.uf} value={s.uf}>
                {s.uf}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {statusOptions ? (
        <div className="space-y-1.5">
          <label htmlFor="status" className="text-xs font-medium text-muted-foreground">
            Situação
          </label>
          <select id="status" name="status" defaultValue={values.status ?? ''} className={cn(selectClass, 'w-full md:w-44')}>
            <option value="">Todas</option>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <Button type="submit" className="md:w-auto">
        <Search className="h-4 w-4" /> Filtrar
      </Button>
    </form>
  );
}
