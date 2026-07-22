'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { setAthleteBenefits } from '@/features/profile/actions';
import { BENEFIT_TYPES } from '@/lib/constants';

export function BenefitsSelector({ selected }: { selected: string[] }) {
  const router = useRouter();
  const [values, setValues] = React.useState<Set<string>>(new Set(selected));
  const [saving, setSaving] = React.useState(false);

  function toggle(slug: string) {
    setValues((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  async function onSave() {
    setSaving(true);
    const res = await setAthleteBenefits(Array.from(values));
    setSaving(false);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success('Contrapartidas atualizadas!');
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <p className="text-sm text-muted-foreground">
          Selecione o que você pode oferecer a patrocinadores.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {BENEFIT_TYPES.map((b) => (
            <label key={b.slug} className="flex items-center gap-2 text-sm">
              <Checkbox checked={values.has(b.slug)} onCheckedChange={() => toggle(b.slug)} />
              {b.label}
            </label>
          ))}
        </div>
        <Button onClick={onSave} disabled={saving} size="sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar contrapartidas'}
        </Button>
      </CardContent>
    </Card>
  );
}
