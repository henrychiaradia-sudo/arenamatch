'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toggle } from './media-forms';
import { TV_TYPES, AUD_DIMENSIONS, MERCH_TYPES } from '@/lib/performance/nivelb';
import {
  tvSchema,
  audienceSchema,
  hospitalitySchema,
  licensingSchema,
  merchSchema,
  type TvInput,
  type AudienceInput,
  type HospitalityInput,
  type LicensingInput,
  type MerchInput,
} from '@/schemas/nivelb';
import {
  addTvExposure,
  addAudienceSegment,
  addHospitality,
  addLicensing,
  addMerchandising,
} from './nivelb-actions';

const selectCls =
  'h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function SubmitRow({ submitting, onCancel }: { submitting: boolean; onCancel: () => void }) {
  return (
    <div className="flex gap-2">
      <Button type="submit" size="sm" disabled={submitting}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
        Cancelar
      </Button>
    </div>
  );
}

export function TvForm({ dealId }: { dealId: string }) {
  return (
    <Toggle label="Adicionar exposição">
      {(close) => <TvFields dealId={dealId} close={close} />}
    </Toggle>
  );
}
function TvFields({ dealId, close }: { dealId: string; close: () => void }) {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<TvInput>({
    resolver: zodResolver(tvSchema),
    defaultValues: { exposureType: 'logo' },
  });
  async function onSubmit(v: TvInput) {
    const r = await addTvExposure(dealId, v);
    if (!r.ok) return toast.error('Erro', { description: r.error });
    toast.success('Exposição adicionada'); close(); router.refresh();
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Programa / transmissão"><Input placeholder="Ex.: Jornal Nacional" {...register('program')} /></Field>
        <Field label="Tipo de exposição">
          <select className={selectCls} {...register('exposureType')}>
            {TV_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Field label="Segundos"><Input type="number" {...register('seconds')} /></Field>
        <Field label="Inserções"><Input type="number" {...register('insertions')} /></Field>
        <Field label="Audiência"><Input type="number" {...register('audience')} /></Field>
        <Field label="Valor equiv. (R$)"><Input type="number" step="0.01" {...register('aveReais')} /></Field>
      </div>
      <SubmitRow submitting={isSubmitting} onCancel={close} />
    </form>
  );
}

export function AudienceForm({ dealId }: { dealId: string }) {
  return (
    <Toggle label="Adicionar segmento">
      {(close) => <AudienceFields dealId={dealId} close={close} />}
    </Toggle>
  );
}
function AudienceFields({ dealId, close }: { dealId: string; close: () => void }) {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<AudienceInput>({
    resolver: zodResolver(audienceSchema),
    defaultValues: { dimension: 'genero' },
  });
  async function onSubmit(v: AudienceInput) {
    const r = await addAudienceSegment(dealId, v);
    if (!r.ok) return toast.error('Erro', { description: r.error });
    toast.success('Segmento adicionado'); close(); router.refresh();
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Dimensão">
          <select className={selectCls} {...register('dimension')}>
            {AUD_DIMENSIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Rótulo"><Input placeholder="Ex.: 18–24 anos" {...register('label')} /></Field>
        <Field label="% do público"><Input type="number" step="0.1" {...register('pct')} /></Field>
      </div>
      <SubmitRow submitting={isSubmitting} onCancel={close} />
    </form>
  );
}

export function HospitalityForm({ dealId }: { dealId: string }) {
  return (
    <Toggle label="Adicionar evento">
      {(close) => <HospitalityFields dealId={dealId} close={close} />}
    </Toggle>
  );
}
function HospitalityFields({ dealId, close }: { dealId: string; close: () => void }) {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<HospitalityInput>({
    resolver: zodResolver(hospitalitySchema),
  });
  async function onSubmit(v: HospitalityInput) {
    const r = await addHospitality(dealId, v);
    if (!r.ok) return toast.error('Erro', { description: r.error });
    toast.success('Evento adicionado'); close(); router.refresh();
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <Field label="Evento"><Input placeholder="Ex.: Camarote Final" {...register('eventName')} /></Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Convidados"><Input type="number" {...register('guests')} /></Field>
        <Field label="Clientes"><Input type="number" {...register('clients')} /></Field>
        <Field label="Executivos"><Input type="number" {...register('executives')} /></Field>
        <Field label="Negócios iniciados"><Input type="number" {...register('dealsStarted')} /></Field>
        <Field label="Negócios fechados"><Input type="number" {...register('dealsClosed')} /></Field>
        <Field label="Satisfação (0–10)"><Input type="number" step="0.1" {...register('satisfaction')} /></Field>
      </div>
      <SubmitRow submitting={isSubmitting} onCancel={close} />
    </form>
  );
}

export function LicensingForm({ dealId }: { dealId: string }) {
  return (
    <Toggle label="Adicionar produto">
      {(close) => <LicensingFields dealId={dealId} close={close} />}
    </Toggle>
  );
}
function LicensingFields({ dealId, close }: { dealId: string; close: () => void }) {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<LicensingInput>({
    resolver: zodResolver(licensingSchema),
  });
  async function onSubmit(v: LicensingInput) {
    const r = await addLicensing(dealId, v);
    if (!r.ok) return toast.error('Erro', { description: r.error });
    toast.success('Produto adicionado'); close(); router.refresh();
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Produto"><Input placeholder="Ex.: Camisa oficial" {...register('product')} /></Field>
        <Field label="Região (opcional)"><Input placeholder="Ex.: Sudeste" {...register('region')} /></Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Unidades vendidas"><Input type="number" {...register('unitsSold')} /></Field>
        <Field label="Receita (R$)"><Input type="number" step="0.01" {...register('revenueReais')} /></Field>
        <Field label="Royalties (R$)"><Input type="number" step="0.01" {...register('royaltiesReais')} /></Field>
      </div>
      <SubmitRow submitting={isSubmitting} onCancel={close} />
    </form>
  );
}

export function MerchForm({ dealId }: { dealId: string }) {
  return (
    <Toggle label="Adicionar PDV">
      {(close) => <MerchFields dealId={dealId} close={close} />}
    </Toggle>
  );
}
function MerchFields({ dealId, close }: { dealId: string; close: () => void }) {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<MerchInput>({
    resolver: zodResolver(merchSchema),
    defaultValues: { materialType: 'display' },
  });
  async function onSubmit(v: MerchInput) {
    const r = await addMerchandising(dealId, v);
    if (!r.ok) return toast.error('Erro', { description: r.error });
    toast.success('PDV adicionado'); close(); router.refresh();
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Ponto de venda"><Input placeholder="Ex.: Rede Supermercados X" {...register('pdvName')} /></Field>
        <Field label="Região (opcional)"><Input placeholder="Ex.: Nordeste" {...register('region')} /></Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Tipo de material">
          <select className={selectCls} {...register('materialType')}>
            {MERCH_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Pontos de exposição"><Input type="number" {...register('points')} /></Field>
      </div>
      <SubmitRow submitting={isSubmitting} onCancel={close} />
    </form>
  );
}
