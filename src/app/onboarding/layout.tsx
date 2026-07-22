import { Logo } from '@/components/brand/logo';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center">
          <Logo />
        </div>
      </header>
      <main id="conteudo" className="container max-w-3xl py-10">
        {children}
      </main>
    </div>
  );
}
