import { z } from 'zod';
import { FUNDING_MODELS, PROJECT_STATUSES } from '@/types/enums';

const uf = z
  .string()
  .length(2)
  .transform((v) => v.toUpperCase())
  .or(z.literal(''));

export const projectSchema = z.object({
  title: z.string().min(3, 'Informe o título do projeto.').max(200),
  description: z.string().max(5000).optional().or(z.literal('')),
  sportSlug: z.string().optional().or(z.literal('')),
  category: z.string().max(120).optional().or(z.literal('')),
  state: uf.optional(),
  city: z.string().max(120).optional().or(z.literal('')),
  scope: z.string().max(200).optional().or(z.literal('')),
  beneficiaries: z.string().max(400).optional().or(z.literal('')),
  objectives: z.string().max(2000).optional().or(z.literal('')),
  timeline: z.string().max(400).optional().or(z.literal('')),
  totalReais: z.coerce.number().min(0).max(1_000_000_000).optional(),
  fundingModel: z.enum(FUNDING_MODELS).default('incentive'),
  processNumber: z.string().max(120).optional().or(z.literal('')),
  deadline: z.string().optional().or(z.literal('')),
  hasSocialImpact: z.boolean().default(true),
});
export type ProjectInput = z.infer<typeof projectSchema>;

export const projectStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(PROJECT_STATUSES),
});
