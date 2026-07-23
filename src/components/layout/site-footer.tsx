import Link from 'next/link';
import { Instagram, Linkedin, Youtube, Facebook, Twitter } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { appConfig } from '@/config/app';
import { FOOTER_NAV } from '@/config/nav';

const socials = [
  { label: 'Instagram', href: '#', icon: Instagram },
  { label: 'LinkedIn', href: '#', icon: Linkedin },
  { label: 'YouTube', href: '#', icon: Youtube },
  { label: 'Facebook', href: '#', icon: Facebook },
  { label: 'X (Twitter)', href: '#', icon: Twitter },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">{appConfig.tagline}</p>
            {/* Redes sociais (somente ícones por enquanto) */}
            <div className="mt-5 flex items-center gap-2">
              {socials.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="grid h-9 w-9 place-items-center rounded-full border text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <s.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
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
