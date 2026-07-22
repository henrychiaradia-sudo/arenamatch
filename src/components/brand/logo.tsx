import Link from 'next/link';
import { Target } from 'lucide-react';
import { appConfig } from '@/config/app';
import { cn } from '@/lib/utils';

interface LogoProps {
  href?: string;
  className?: string;
  showText?: boolean;
}

/** Logotipo do produto. O nome vem de appConfig (configurável por env). */
export function Logo({ href = '/', className, showText = true }: LogoProps) {
  return (
    <Link href={href} className={cn('flex items-center gap-2', className)}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Target className="h-5 w-5" />
      </span>
      {showText ? (
        <span className="font-display text-lg font-bold tracking-tight">{appConfig.name}</span>
      ) : null}
    </Link>
  );
}
