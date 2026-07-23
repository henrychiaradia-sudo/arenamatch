import { z } from 'zod';

export const clippingSchema = z.object({
  outletType: z.string().min(1, 'Selecione o tipo'),
  outletName: z.string().min(1, 'Informe o veículo').max(160),
  title: z.string().max(200).optional().or(z.literal('')),
  reach: z.coerce.number().int('Use um inteiro').min(0, 'Mínimo 0'),
  aveReais: z.coerce.number().min(0, 'Mínimo 0'),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
});
export type ClippingInput = z.infer<typeof clippingSchema>;

export const surveySchema = z.object({
  metric: z.string().min(1, 'Selecione a métrica'),
  unit: z.string().max(10),
  beforeValue: z.coerce.number(),
  afterValue: z.coerce.number(),
});
export type SurveyInput = z.infer<typeof surveySchema>;

export const leadSchema = z.object({
  source: z.string().min(1, 'Selecione a origem'),
  captured: z.coerce.number().int('Use um inteiro').min(0, 'Mínimo 0'),
  converted: z.coerce.number().int('Use um inteiro').min(0, 'Mínimo 0'),
});
export type LeadInput = z.infer<typeof leadSchema>;
