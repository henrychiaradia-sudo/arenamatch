import type { Metadata } from 'next';
import { appConfig } from '@/config/app';
import { Providers } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.url),
  title: {
    default: `${appConfig.name} — ${appConfig.tagline}`,
    template: `%s · ${appConfig.name}`,
  },
  description: appConfig.description,
  openGraph: {
    title: appConfig.name,
    description: appConfig.description,
    url: appConfig.url,
    siteName: appConfig.name,
    locale: 'pt_BR',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow"
        >
          Pular para o conteúdo
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
