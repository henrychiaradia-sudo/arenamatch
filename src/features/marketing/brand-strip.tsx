import { appConfig } from '@/config/app';

/**
 * "Marcas que apoiam" — grade de logos fictícios (demonstração).
 * Logos são texto estilizado (sem dependência de imagens externas).
 */
const brands: { name: string; className: string }[] = [
  { name: 'VELOZ', className: 'font-display font-extrabold tracking-tight' },
  { name: 'NutriMax', className: 'font-semibold italic' },
  { name: 'PRÓ·SPORT', className: 'font-display font-bold tracking-widest text-sm' },
  { name: 'Atlética', className: 'font-medium' },
  { name: 'MOVE+', className: 'font-display font-black' },
  { name: 'Peak', className: 'font-semibold uppercase tracking-[0.2em] text-sm' },
  { name: 'Fibra', className: 'font-display font-bold lowercase' },
  { name: 'ARENA CORP', className: 'font-semibold tracking-tight text-sm' },
  { name: 'Voltagem', className: 'font-display font-extrabold italic' },
  { name: 'Terra Brasil', className: 'font-medium tracking-tight text-sm' },
  { name: 'IMPULSO', className: 'font-display font-bold tracking-widest text-sm' },
  { name: 'Vértice', className: 'font-semibold' },
];

export function BrandStrip() {
  return (
    <section className="border-y bg-muted/20">
      <div className="container py-12 md:py-16">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Marcas que apoiam o esporte no {appConfig.name}
        </p>
        <div className="mx-auto mt-8 grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3 lg:grid-cols-6">
          {brands.map((b) => (
            <div
              key={b.name}
              className="flex items-center justify-center bg-background px-4 py-7 text-center text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              <span className={`text-lg ${b.className}`}>{b.name}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Marcas fictícias, exibidas apenas para demonstração.
        </p>
      </div>
    </section>
  );
}
