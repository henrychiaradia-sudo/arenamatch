import Link from 'next/link';
import { FileCheck2, Star, Handshake, Trophy, Search, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';
import type { SessionContext } from '@/types/app';

function completion(row: Record<string, unknown> | null): number {
  if (!row) return 10;
  const fields = [
    row.sport_id,
    row.category,
    row.city,
    row.state,
    row.bio,
    row.story,
    row.investment_need_cents,
    row.cover_url,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.max(10, Math.round((filled / fields.length) * 100));
}

export async function AthleteDashboard({ session }: { session: SessionContext }) {
  const supabase = createClient();
  const uid = session.userId;

  const [{ data: athlete }, apps, favs, conns, comps] = await Promise.all([
    supabase.from('athlete_profiles').select('*').eq('profile_id', uid).maybeSingle(),
    supabase.from('applications').select('id', { count: 'exact', head: true }).eq('applicant_profile_id', uid),
    supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('profile_id', uid),
    supabase
      .from('connections')
      .select('id', { count: 'exact', head: true })
      .or(`profile_a.eq.${uid},profile_b.eq.${uid}`),
    supabase.from('competitions').select('id', { count: 'exact', head: true }),
  ]);

  const pct = completion(athlete as Record<string, unknown> | null);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá, ${session.profile.fullName.split(' ')[0]} 👋`}
        description="Acompanhe seu perfil, oportunidades e conexões."
        actions={
          <Button asChild>
            <Link href="/explorar/oportunidades">
              <Search className="h-4 w-4" /> Ver oportunidades
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Complete seu perfil</CardTitle>
          <CardDescription>
            Perfis completos recebem mais interesse de empresas e projetos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Completude</span>
            <span className="font-semibold">{pct}%</span>
          </div>
          <Progress value={pct} />
          <Button asChild variant="outline" size="sm">
            <Link href="/painel/perfil">Editar perfil</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Candidaturas" value={formatNumber(apps.count ?? 0)} icon={FileCheck2} />
        <StatCard label="Favoritos" value={formatNumber(favs.count ?? 0)} icon={Star} />
        <StatCard label="Conexões" value={formatNumber(conns.count ?? 0)} icon={Handshake} />
        <StatCard label="Competições" value={formatNumber(comps.count ?? 0)} icon={Trophy} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" /> Ações recomendadas
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Button asChild variant="outline" className="justify-start">
            <Link href="/painel/perfil">Adicionar conquistas e contrapartidas</Link>
          </Button>
          <Button asChild variant="outline" className="justify-start">
            <Link href="/explorar/oportunidades">Explorar oportunidades compatíveis</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
