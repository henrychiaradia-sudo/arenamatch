import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  User,
  Users,
  Building2,
  FolderKanban,
  Megaphone,
  Search,
  Star,
  MessagesSquare,
  Handshake,
  ClipboardCheck,
  Bell,
  Settings,
  ShieldCheck,
  BarChart3,
  FileCheck2,
  Flag,
  CreditCard,
  Trophy,
  Mail,
} from 'lucide-react';
import type { UserRole } from '@/types/enums';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

/** Links do menu público (header). */
export const PUBLIC_NAV: { title: string; href: string }[] = [
  { title: 'Como funciona', href: '/como-funciona' },
  { title: 'Para atletas', href: '/para-atletas' },
  { title: 'Para empresas', href: '/para-empresas' },
  { title: 'Para gestores', href: '/para-gestores' },
  { title: 'Explorar', href: '/explorar/atletas' },
  { title: 'Planos', href: '/planos' },
];

/** Colunas de links do rodapé. */
export const FOOTER_NAV: { heading: string; links: { title: string; href: string }[] }[] = [
  {
    heading: 'Plataforma',
    links: [
      { title: 'Como funciona', href: '/como-funciona' },
      { title: 'Explorar atletas', href: '/explorar/atletas' },
      { title: 'Explorar projetos', href: '/explorar/projetos' },
      { title: 'Explorar oportunidades', href: '/explorar/oportunidades' },
      { title: 'Planos', href: '/planos' },
    ],
  },
  {
    heading: 'Para você',
    links: [
      { title: 'Para atletas', href: '/para-atletas' },
      { title: 'Para empresas', href: '/para-empresas' },
      { title: 'Para gestores', href: '/para-gestores' },
    ],
  },
  {
    heading: 'Institucional',
    links: [
      { title: 'Sobre', href: '/sobre' },
      { title: 'Contato', href: '/contato' },
      { title: 'Termos de uso', href: '/termos' },
      { title: 'Privacidade', href: '/privacidade' },
    ],
  },
];

/** Navegação lateral por papel (área autenticada). */
export const APP_NAV: Record<UserRole, NavItem[]> = {
  athlete: [
    { title: 'Painel', href: '/painel', icon: LayoutDashboard },
    { title: 'Meu perfil', href: '/painel/perfil', icon: User },
    { title: 'Explorar oportunidades', href: '/explorar/oportunidades', icon: Search },
    { title: 'Minhas candidaturas', href: '/painel/candidaturas', icon: FileCheck2 },
    { title: 'Projetos', href: '/painel/projetos', icon: FolderKanban },
    { title: 'Conexões', href: '/painel/conexoes', icon: Handshake },
    { title: 'Mensagens', href: '/painel/mensagens', icon: MessagesSquare },
    { title: 'Contrapartidas', href: '/painel/contrapartidas', icon: ClipboardCheck },
    { title: 'Favoritos', href: '/painel/favoritos', icon: Star },
    { title: 'Competições', href: '/painel/competicoes', icon: Trophy },
  ],
  company: [
    { title: 'Painel', href: '/painel', icon: LayoutDashboard },
    { title: 'Perfil da empresa', href: '/painel/perfil', icon: Building2 },
    { title: 'Buscar atletas', href: '/explorar/atletas', icon: Users },
    { title: 'Buscar projetos', href: '/explorar/projetos', icon: FolderKanban },
    { title: 'Minhas oportunidades', href: '/painel/oportunidades', icon: Megaphone },
    { title: 'Pipeline', href: '/painel/pipeline', icon: BarChart3 },
    { title: 'Conexões', href: '/painel/conexoes', icon: Handshake },
    { title: 'Mensagens', href: '/painel/mensagens', icon: MessagesSquare },
    { title: 'Contrapartidas', href: '/painel/contrapartidas', icon: ClipboardCheck },
    { title: 'Favoritos', href: '/painel/favoritos', icon: Star },
  ],
  manager: [
    { title: 'Painel', href: '/painel', icon: LayoutDashboard },
    { title: 'Meu perfil', href: '/painel/perfil', icon: User },
    { title: 'Meus projetos', href: '/painel/projetos', icon: FolderKanban },
    { title: 'Buscar empresas', href: '/explorar/empresas', icon: Building2 },
    { title: 'Interessados', href: '/painel/interessados', icon: Handshake },
    { title: 'Mensagens', href: '/painel/mensagens', icon: MessagesSquare },
    { title: 'Documentos', href: '/painel/documentos', icon: FileCheck2 },
    { title: 'Favoritos', href: '/painel/favoritos', icon: Star },
  ],
  admin: [
    { title: 'Visão geral', href: '/admin', icon: LayoutDashboard },
    { title: 'Usuários', href: '/admin/usuarios', icon: Users },
    { title: 'Verificações', href: '/admin/verificacoes', icon: ShieldCheck },
    { title: 'Projetos', href: '/admin/projetos', icon: FolderKanban },
    { title: 'Oportunidades', href: '/admin/oportunidades', icon: Megaphone },
    { title: 'Denúncias', href: '/admin/denuncias', icon: Flag },
    { title: 'Contato & Newsletter', href: '/admin/contato', icon: Mail },
    { title: 'Planos', href: '/admin/planos', icon: CreditCard },
    { title: 'Auditoria', href: '/admin/auditoria', icon: FileCheck2 },
    { title: 'Configurações', href: '/admin/configuracoes', icon: Settings },
  ],
};

/** Item de configurações comum ao rodapé da sidebar (não-admin). */
export const APP_NAV_FOOTER: NavItem[] = [
  { title: 'Notificações', href: '/painel/notificacoes', icon: Bell },
  { title: 'Planos', href: '/painel/planos', icon: CreditCard },
  { title: 'Configurações', href: '/painel/configuracoes', icon: Settings },
];
