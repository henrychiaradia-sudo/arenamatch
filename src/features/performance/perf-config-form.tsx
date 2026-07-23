'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { perfConfigSchema, type PerfConfigInput } from '@/schemas/performance';
import { savePerformanceConfig } from './actions';

interface Props {
  dealId: string;
  cpmReais: number;
  extraCostReais: number;
  otherValueReais: number;
  reachOverride: number;
}

export function PerfConfigForm({ dealId, cpmReais, extraCostReais, otherValueReais, reachOverride }: Props) {
  const [open, setOpen] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PerfConfigInput>({
    resolver: zodResolver(perfConfigSchema),
    defaultValues: { cpmReais, extraCostReais, otherValueReais, reachOverride },
  });

  async function onSubmit(values: PerfConfigInput) {
    const res = await savePerformanceConfig(dealId, values);
    if (!res.ok) {
      toast.error('Não foi possível salvar', { description: res.error });
      return;
    }
    toast.success('Parâmetros atualizados', { description: 'Os indicadores foram recalculados.' });
    setOpen(false);
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <SlidersHorizontal className="h-4 w-4" /> Calibrar parâmetros
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cpm">CPM — custo por mil impressões (R$)</Label>
          <Input id="cpm" type="number" step="0.01" {...register('cpmReais')} />
          {errors.cpmReais ? <p className="text-sm text-destructive">{errors.cpmReais.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="reach">Alcance total (deixe 0 para estimar)</Label>
          <Input id="reach" type="number" step="1" {...register('reachOverride')} />
          {errors.reachOverride ? (
            <p className="text-sm text-destructive">{errors.reachOverride.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="extra">Ativações extras — custo (R$)</Label>
          <Input id="extra" type="number" step="0.01" {...register('extraCostReais')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="other">Valor de ativações/eventos (R$)</Label>
          <Input id="other" type="number" step="0.01" {...register('otherValueReais')} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar e recalcular'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
