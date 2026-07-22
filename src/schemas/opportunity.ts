import { z } from 'zod';
import { INVESTMENT_MODELS, OPPORTUNITY_STATUSES } from '@/types/enums';

export const opportunitySchema = z.object({
  title: z.string().min(3, 'Informe o título.').max(200),
  description: z.string().max(5000).optional().or(z.literal('')),
  campaignGoal: z.string().max(500).optional().or(z.literal('')),
  desiredAthleteProfile: z.string().max(1000).optional().or(z.literal('')),
  investmentModel: z.enum(INVESTMENT_MODELS).default('both'),
  minInvestmentReais: z.coerce.number().min(0).max(100_000_000).optional(),
  maxInvestmentReais: z.coerce.number().min(0).max(100_000_000).optional(),
  resourceType: z.string().max(200).optional().or(z.literal('')),
  duration: z.string().max(200).optional().or(z.literal('')),
  deadline: z.string().optional().or(z.literal('')),
  estimatedSlots: z.coerce.number().int().min(0).max(100000).optional(),
  requirements: z.string().max(2000).optional().or(z.literal('')),
  criteria: z.string().max(2000).optional().or(z.literal('')),
  regionStates: z.array(z.string().length(2)).optional().default([]),
  desiredBenefits: z.array(z.string()).optional().default([]),
  sportsSlugs: z.array(z.string()).optional().default([]),
});
export type OpportunityInput = z.infer<typeof opportunitySchema>;

export const opportunityStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(OPPORTUNITY_STATUSES),
});
