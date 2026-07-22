'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateProjectStatus, deleteProject } from '@/features/projects/actions';
import { PROJECT_STATUSES, projectStatusLabels, type ProjectStatus } from '@/types/enums';

export function ProjectRowActions({ id, status }: { id: string; status: ProjectStatus }) {
  const router = useRouter();

  async function onStatus(value: string) {
    const res = await updateProjectStatus(id, value as ProjectStatus);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success('Situação atualizada');
    router.refresh();
  }

  async function onDelete() {
    const res = await deleteProject(id);
    if (!res.ok) return toast.error('Erro', { description: res.error });
    toast.success('Projeto excluído');
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={onStatus}>
        <SelectTrigger className="h-9 w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PROJECT_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {projectStatusLabels[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button asChild variant="outline" size="icon" aria-label="Editar">
        <Link href={`/painel/projetos/${id}`}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>
      <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Excluir">
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
