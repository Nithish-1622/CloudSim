import { prisma } from '@cloudsim/database';
import { ChaosConfig } from '@cloudsim/shared';

let cachedChaosConfig: ChaosConfig = {
  latencyInjectionMs: 0,
  errorInjectionPercentage: 0,
  cacheDisabled: false,
  trafficSpikeActive: false,
  updatedAt: new Date().toISOString(),
};

export class ChaosService {
  public static async getConfig(): Promise<ChaosConfig> {
    if (process.env.DATABASE_URL) {
      try {
        const dbConfig = await prisma.chaosConfig.findUnique({
          where: { id: 'default' },
        });
        if (dbConfig) {
          cachedChaosConfig = {
            latencyInjectionMs: dbConfig.latencyInjectionMs,
            errorInjectionPercentage: dbConfig.errorInjectionPercentage,
            cacheDisabled: dbConfig.cacheDisabled,
            trafficSpikeActive: dbConfig.trafficSpikeActive,
            updatedAt: dbConfig.updatedAt.toISOString(),
          };
        }
      } catch (err) {}
    }

    return cachedChaosConfig;
  }

  public static async updateConfig(update: Partial<ChaosConfig>): Promise<ChaosConfig> {
    if (process.env.DATABASE_URL) {
      try {
        const updated = await prisma.chaosConfig.upsert({
          where: { id: 'default' },
          update: {
            latencyInjectionMs: update.latencyInjectionMs,
            errorInjectionPercentage: update.errorInjectionPercentage,
            cacheDisabled: update.cacheDisabled,
            trafficSpikeActive: update.trafficSpikeActive,
          },
          create: {
            id: 'default',
            latencyInjectionMs: update.latencyInjectionMs ?? 0,
            errorInjectionPercentage: update.errorInjectionPercentage ?? 0,
            cacheDisabled: update.cacheDisabled ?? false,
            trafficSpikeActive: update.trafficSpikeActive ?? false,
          },
        });

        cachedChaosConfig = {
          latencyInjectionMs: updated.latencyInjectionMs,
          errorInjectionPercentage: updated.errorInjectionPercentage,
          cacheDisabled: updated.cacheDisabled,
          trafficSpikeActive: updated.trafficSpikeActive,
          updatedAt: updated.updatedAt.toISOString(),
        };
        return cachedChaosConfig;
      } catch (err) {}
    }

    cachedChaosConfig = {
      ...cachedChaosConfig,
      ...update,
      updatedAt: new Date().toISOString(),
    };
    return cachedChaosConfig;
  }

  public static async reset(): Promise<ChaosConfig> {
    return this.updateConfig({
      latencyInjectionMs: 0,
      errorInjectionPercentage: 0,
      cacheDisabled: false,
      trafficSpikeActive: false,
    });
  }
}
