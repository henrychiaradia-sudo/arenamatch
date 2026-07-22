'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Logo } from '@/components/brand/logo';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { UserNav } from '@/components/layout/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { APP_NAV, APP_NAV_FOOTER } from '@/config/nav';
import type { UserRole } from '@/types/enums';

interface AppShellProps {
  role: UserRole;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  unreadNotifications?: number;
  children: React.ReactNode;
}

export function AppShell({
  role,
  fullName,
  email,
  avatarUrl,
  unreadNotifications = 0,
  children,
}: AppShellProps) {
  const [open, setOpen] = React.useState(false);
  const items = APP_NAV[role];
  const footer = role === 'admin' ? [] : APP_NAV_FOOTER;

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-card lg:flex">
        <div className="flex h-16 items-center border-b px-6">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <SidebarNav items={items} />
        </div>
        {footer.length ? (
          <div className="border-t px-3 py-4">
            <SidebarNav items={footer} />
          </div>
        ) : null}
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {/* Sidebar mobile */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="flex h-16 flex-row items-center border-b px-6">
                <SheetTitle className="text-left">
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <div className="px-3 py-4">
                <SidebarNav items={items} onNavigate={() => setOpen(false)} />
                {footer.length ? (
                  <div className="mt-4 border-t pt-4">
                    <SidebarNav items={footer} onNavigate={() => setOpen(false)} />
                  </div>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1" />

          <Button asChild variant="ghost" size="icon" aria-label="Notificações" className="relative">
            <Link href="/painel/notificacoes">
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              ) : null}
            </Link>
          </Button>
          <ThemeToggle />
          <UserNav fullName={fullName} email={email} avatarUrl={avatarUrl} role={role} />
        </header>

        <main id="conteudo" className="mx-auto max-w-6xl px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
