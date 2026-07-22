'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Logo } from '@/components/brand/logo';
import { PUBLIC_NAV } from '@/config/nav';

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle className="text-left">
            <Logo />
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-1">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {item.title}
            </Link>
          ))}
        </nav>
        <div className="mt-6 flex flex-col gap-2">
          <Button asChild variant="outline" onClick={() => setOpen(false)}>
            <Link href="/entrar">Entrar</Link>
          </Button>
          <Button asChild onClick={() => setOpen(false)}>
            <Link href="/cadastro">Cadastre-se</Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
