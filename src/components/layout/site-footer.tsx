import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { appConfig } from '@/config/app';
import { FOOTER_NAV } from '@/config/nav';

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">{appConfig.tagline}</p>
          </div>

          {FOOTER_NAV.map((col) => (
            <div key={col.heading}>
              <h4 className="text-sm font-semibold">{col.heading}</h4>
              <ul className="mt-4 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {appConfig.name}. Todos os direitos reservados.
          </p>
          <p className="text-xs">
            Plataforma demonstrativa (MVP). Dados e depoimentos são fictícios.
          </p>
        </div>
      </div>
    </footer>
  );
}
