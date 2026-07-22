'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, User, Settings, CreditCard } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createClient } from '@/lib/supabase/client';
import { getInitials } from '@/lib/utils';
import { userRoleLabels, type UserRole } from '@/types/enums';

interface UserNavProps {
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
}

export function UserNav({ fullName, email, avatarUrl, role }: UserNavProps) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={fullName} /> : null}
            <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate">{fullName}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">{email}</span>
          <span className="mt-1 text-xs font-normal text-primary">{userRoleLabels[role]}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/painel/perfil">
            <User /> Meu perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/painel/planos">
            <CreditCard /> Planos
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/painel/configuracoes">
            <Settings /> Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
          <LogOut /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
