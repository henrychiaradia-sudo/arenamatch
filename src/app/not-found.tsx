import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/logo';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/30 px-4 text-center">
      <Logo />
      <div className="space-y-2">
        <p className="font-display text-6xl font-bold text-primary">404</p>
        <h1 className="text-2xl font-semibold">Página não encontrada</h1>
        <p className="max-w-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Voltar para a home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/explorar/atletas">Explorar</Link>
        </Button>
      </div>
    </div>
  );
}
