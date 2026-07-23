import { z } from 'zod';

export const perfConfigSchema = z.object({
  cpmReais: z.coerce.number().min(0, 'Mínimo 0').max(100000, 'Valor muito alto'),
  extraCostReais: z.coerce.number().min(0, 'Mínimo 0'),
  otherValueReais: z.coerce.number().min(0, 'Mínimo 0'),
  reachOverride: z.coerce.number().int('Use um número inteiro').min(0, 'Mínimo 0'),
});
export type PerfConfigInput = z.infer<typeof perfConfigSchema>;
