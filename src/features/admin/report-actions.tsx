'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { resolveReport } from '@/features/admin/actions';

export function ReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();

  async function resolve(status: 'resolved' | 'dismissed') {
    const res = await resolveReport(reportId, status);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success(status === 'resolved' ? 'Denúncia resolvida' : 'Denúncia descartada');
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => resolve('resolved')}>
        <Check className="h-4 w-4" /> Resolver
      </Button>
      <Button size="sm" variant="outline" onClick={() => resolve('dismissed')}>
        <X className="h-4 w-4" /> Descartar
      </Button>
    </div>
  );
}
