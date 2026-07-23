import { z } from 'zod';

export const tvSchema = z.object({
  program: z.string().min(1, 'Informe o programa').max(160),
  exposureType: z.string().min(1),
  seconds: z.coerce.number().int().min(0),
  insertions: z.coerce.number().int().min(0),
  audience: z.coerce.number().int().min(0),
  aveReais: z.coerce.number().min(0),
});
export type TvInput = z.infer<typeof tvSchema>;

export const audienceSchema = z.object({
  dimension: z.string().min(1),
  label: z.string().min(1, 'Informe o rótulo').max(80),
  pct: z.coerce.number().min(0).max(100),
});
export type AudienceInput = z.infer<typeof audienceSchema>;

export const hospitalitySchema = z.object({
  eventName: z.string().min(1, 'Informe o evento').max(160),
  guests: z.coerce.number().int().min(0),
  clients: z.coerce.number().int().min(0),
  executives: z.coerce.number().int().min(0),
  dealsStarted: z.coerce.number().int().min(0),
  dealsClosed: z.coerce.number().int().min(0),
  satisfaction: z.coerce.number().min(0).max(10),
});
export type HospitalityInput = z.infer<typeof hospitalitySchema>;

export const licensingSchema = z.object({
  product: z.string().min(1, 'Informe o produto').max(160),
  region: z.string().max(80).optional().or(z.literal('')),
  unitsSold: z.coerce.number().int().min(0),
  revenueReais: z.coerce.number().min(0),
  royaltiesReais: z.coerce.number().min(0),
});
export type LicensingInput = z.infer<typeof licensingSchema>;

export const merchSchema = z.object({
  pdvName: z.string().min(1, 'Informe o PDV').max(160),
  region: z.string().max(80).optional().or(z.literal('')),
  materialType: z.string().min(1),
  points: z.coerce.number().int().min(0),
});
export type MerchInput = z.infer<typeof merchSchema>;
