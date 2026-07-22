import { z } from 'zod';
import { INVESTMENT_MODELS } from '@/types/enums';

/** Schemas de perfil (validação cliente + servidor). Campos majoritariamente
 * opcionais para permitir "salvar e continuar depois" no onboarding. */

const uf = z
  .string()
  .length(2)
  .transform((v) => v.toUpperCase())
  .or(z.literal(''));

export const profileBasicsSchema = z.object({
  fullName: z.string().min(3, 'Informe o nome.').max(120),
  headline: z.string().max(160).optional().or(z.literal('')),
});
export type ProfileBasicsInput = z.infer<typeof profileBasicsSchema>;

export const athleteProfileSchema = z.object({
  sportSlug: z.string().optional().or(z.literal('')),
  category: z.string().optional().or(z.literal('')),
  city: z.string().max(120).optional().or(z.literal('')),
  state: uf.optional(),
  gender: z.string().max(30).optional().or(z.literal('')),
  bio: z.string().max(2000).optional().or(z.literal('')),
  story: z.string().max(5000).optional().or(z.literal('')),
  team: z.string().max(200).optional().or(z.literal('')),
  federation: z.string().max(200).optional().or(z.literal('')),
  ranking: z.string().max(200).optional().or(z.literal('')),
  followersTotal: z.coerce.number().int().min(0).max(1_000_000_000).optional(),
  engagementRate: z.coerce.number().min(0).max(100).optional(),
  investmentNeedReais: z.coerce.number().min(0).max(100_000_000).optional(),
  fundraisingGoal: z.string().max(300).optional().or(z.literal('')),
  acceptsDirect: z.boolean().default(true),
  acceptsIncentive: z.boolean().default(false),
  availableForCampaigns: z.boolean().default(true),
  audienceTags: z.string().max(300).optional().or(z.literal('')), // separadas por vírgula
});
export type AthleteProfileInput = z.infer<typeof athleteProfileSchema>;

export const companyProfileSchema = z.object({
  legalName: z.string().max(200).optional().or(z.literal('')),
  publicName: z.string().max(200).optional().or(z.literal('')),
  segment: z.string().max(120).optional().or(z.literal('')),
  size: z.string().max(40).optional().or(z.literal('')),
  city: z.string().max(120).optional().or(z.literal('')),
  state: uf.optional(),
  description: z.string().max(3000).optional().or(z.literal('')),
  website: z.string().url('URL inválida.').optional().or(z.literal('')),
  investmentModel: z.enum(INVESTMENT_MODELS).default('both'),
  minInvestmentReais: z.coerce.number().min(0).max(100_000_000).optional(),
  maxInvestmentReais: z.coerce.number().min(0).max(100_000_000).optional(),
  objectives: z.string().max(400).optional().or(z.literal('')),
  priorityStates: z.array(z.string().length(2)).optional().default([]),
  sportsInterest: z.array(z.string()).optional().default([]),
});
export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;

export const managerProfileSchema = z.object({
  isOrganization: z.boolean().default(false),
  orgName: z.string().max(200).optional().or(z.literal('')),
  experience: z.string().max(3000).optional().or(z.literal('')),
  areas: z.string().max(400).optional().or(z.literal('')), // separadas por vírgula
});
export type ManagerProfileInput = z.infer<typeof managerProfileSchema>;

export const achievementSchema = z.object({
  title: z.string().min(2, 'Informe o título.').max(200),
  description: z.string().max(1000).optional().or(z.literal('')),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  position: z.string().max(120).optional().or(z.literal('')),
});
export type AchievementInput = z.infer<typeof achievementSchema>;

export const socialAccountSchema = z.object({
  platform: z.string().min(2, 'Informe a rede.').max(40),
  handle: z.string().max(120).optional().or(z.literal('')),
  url: z.string().url('URL inválida.').optional().or(z.literal('')),
  followers: z.coerce.number().int().min(0).optional(),
});
export type SocialAccountInput = z.infer<typeof socialAccountSchema>;

export const sponsorshipNeedSchema = z.object({
  title: z.string().min(2, 'Informe o título.').max(200),
  description: z.string().max(1000).optional().or(z.literal('')),
  amountReais: z.coerce.number().min(0).max(100_000_000).optional(),
});
export type SponsorshipNeedInput = z.infer<typeof sponsorshipNeedSchema>;

/** Utilitário: transforma "a, b, c" em ['a','b','c'] (sem vazios). */
export function parseTags(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}
