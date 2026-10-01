import { z } from 'zod';

export const CreateSimulationSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  application: z.enum(['student_erp', 'crm', 'ecommerce']),
  virtualUsers: z.number().int().min(1).max(1000000),
  targetRps: z.number().int().min(1).max(10000),
  durationSeconds: z.number().int().min(5).max(3600),
  trafficPattern: z.enum([
    'NORMAL',
    'RAMP_UP',
    'RAMP_DOWN',
    'SPIKE',
    'BURST',
    'FLASH_SALE',
    'CHAOS',
  ]),
  cacheEnabled: z.boolean().default(true),
  intensity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EXTREME']).default('MEDIUM'),
});

export type CreateSimulationInput = z.infer<typeof CreateSimulationSchema>;

export const UpdateChaosConfigSchema = z.object({
  latencyInjectionMs: z.number().min(0).max(10000),
  errorInjectionPercentage: z.number().min(0).max(100),
  cacheDisabled: z.boolean(),
  trafficSpikeActive: z.boolean(),
});

export type UpdateChaosConfigInput = z.infer<typeof UpdateChaosConfigSchema>;

export const AuthLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type AuthLoginInput = z.infer<typeof AuthLoginSchema>;
