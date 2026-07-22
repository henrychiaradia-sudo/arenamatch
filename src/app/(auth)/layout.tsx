import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/brand/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <div className="mb-6">
        <Logo />
      </div>
      <div className="w-full max-w-md">{children}</div>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar para a home
      </Link>
    </div>
  );
}
