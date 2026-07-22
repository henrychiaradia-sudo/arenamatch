import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata: Metadata = { title: 'Entrar' };

export default function EntrarPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  return <LoginForm redirectTo={searchParams.redirect ?? '/painel'} />;
}
