'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/logo';
import { ThemeToggle } from '@/components/theme-toggle';
import { MobileNav } from '@/components/layout/mobile-nav';
import { PUBLIC_NAV } from '@/config/nav';
import { cn } from '@/lib/utils';

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MobileNav />
          <Logo />
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {PUBLIC_NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground',
                  active ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/entrar">Entrar</Link>
          </Button>
          <Button asChild>
            <Link href="/cadastro">Cadastre-se</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
