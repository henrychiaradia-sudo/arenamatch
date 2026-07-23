'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  clippingSchema,
  surveySchema,
  leadSchema,
  type ClippingInput,
  type SurveyInput,
  type LeadInput,
} from '@/schemas/media';
import { OUTLET_TYPES, SENTIMENTS, SURVEY_METRICS, LEAD_SOURCES } from '@/lib/performance/media';
import { addClipping, addSurveyMetric, addLead } from './media-actions';

const selectCls =
  'h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

export function Toggle({ label, children }: { label: string; children: (close: () => void) => React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> {label}
      </Button>
    );
  }
  return <div className="rounded-lg border bg-muted/30 p-4">{children(() => setOpen(false))}</div>;
}

export function ClippingForm({ dealId }: { dealId: string }) {
  const router = useRouter();
  return (
    <Toggle label="Adicionar matéria">
      {(close) => <ClippingFields dealId={dealId} onDone={() => { close(); router.refresh(); }} />}
    </Toggle>
  );
}

function ClippingFields({ dealId, onDone }: { dealId: string; onDone: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClippingInput>({
    resolver: zodResolver(clippingSchema),
    defaultValues: { sentiment: 'positive', outletType: 'portal' },
  });
  async function onSubmit(v: ClippingInput) {
    const res = await addClipping(dealId, v);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success('Matéria adicionada');
    onDone();
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Tipo de mídia</Label>
          <select className={selectCls} {...register('outletType')}>
            {OUTLET_TYPES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Veículo</Label>
          <Input placeholder="Ex.: Globo Esporte" {...register('outletName')} />
          {errors.outletName ? <p className="text-xs text-destructive">{errors.outletName.message}</p> : null}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Título da matéria (opcional)</Label>
        <Input {...register('title')} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Audiência / alcance</Label>
          <Input type="number" step="1" {...register('reach')} />
        </div>
        <div className="space-y-1.5">
          <Label>Valor de mídia (AVE, R$)</Label>
          <Input type="number" step="0.01" {...register('aveReais')} />
        </div>
        <div className="space-y-1.5">
          <Label>Sentimento</Label>
          <select className={selectCls} {...register('sentiment')}>
            {SENTIMENTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>Cancelar</Button>
      </div>
    </form>
  );
}

export function SurveyForm({ dealId }: { dealId: string }) {
  const router = useRouter();
  return (
    <Toggle label="Adicionar métrica">
      {(close) => <SurveyFields dealId={dealId} onDone={() => { close(); router.refresh(); }} />}
    </Toggle>
  );
}

function SurveyFields({ dealId, onDone }: { dealId: string; onDone: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SurveyInput>({
    resolver: zodResolver(surveySchema),
    defaultValues: { metric: 'recall_espontaneo', unit: '%' },
  });
  async function onSubmit(v: SurveyInput) {
    const res = await addSurveyMetric(dealId, v);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success('Métrica adicionada');
    onDone();
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Métrica</Label>
          <select className={selectCls} {...register('metric')}>
            {SURVEY_METRICS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Unidade</Label>
          <select className={selectCls} {...register('unit')}>
            <option value="%">%</option>
            <option value="pts">pontos</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Antes</Label>
          <Input type="number" step="0.1" {...register('beforeValue')} />
        </div>
        <div className="space-y-1.5">
          <Label>Depois</Label>
          <Input type="number" step="0.1" {...register('afterValue')} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>Cancelar</Button>
      </div>
    </form>
  );
}

export function LeadForm({ dealId }: { dealId: string }) {
  const router = useRouter();
  return (
    <Toggle label="Adicionar leads">
      {(close) => <LeadFields dealId={dealId} onDone={() => { close(); router.refresh(); }} />}
    </Toggle>
  );
}

function LeadFields({ dealId, onDone }: { dealId: string; onDone: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: { source: 'landing_page' },
  });
  async function onSubmit(v: LeadInput) {
    const res = await addLead(dealId, v);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success('Leads adicionados');
    onDone();
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Origem</Label>
          <select className={selectCls} {...register('source')}>
            {LEAD_SOURCES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Capturados</Label>
          <Input type="number" step="1" {...register('captured')} />
        </div>
        <div className="space-y-1.5">
          <Label>Convertidos</Label>
          <Input type="number" step="1" {...register('converted')} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>Cancelar</Button>
      </div>
    </form>
  );
}
