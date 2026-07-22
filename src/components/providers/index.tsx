'use client';

import * as React from 'react';
import { ThemeProvider } from './theme-provider';
import { QueryProvider } from './query-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

/** Agrupa todos os providers de cliente da aplicação. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <QueryProvider>
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
      </QueryProvider>
      <Toaster position="top-right" richColors />
    </ThemeProvider>
  );
}
