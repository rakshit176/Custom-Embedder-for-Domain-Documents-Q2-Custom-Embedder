/**
 * Multi-tenant configuration and context types.
 * Enables isolation and resource management per tenant.
 */

export interface TenantConfig {
  /** Maximum number of memories a tenant can store. */
  maxMemories: number;
  /** Maximum number of recall operations per month. */
  maxRecallsPerMonth: number;
  /** Whether consolidation is enabled for this tenant. */
  consolidationEnabled: boolean;
  /** Whether STDP temporal learning is enabled. */
  stdpEnabled: boolean;
}

export interface TenantContext {
  /** Unique tenant identifier. */
  tenantId: string;
  /** Tenant-specific configuration. */
  config: TenantConfig;
  /** Current number of stored memories. */
  currentMemories: number;
  /** Number of recalls this month. */
  monthlyRecalls: number;
  /** Reset monthly counters. */
  resetMonthlyCounters(): void;
  /** Increment memory count. */
  incrementMemoryCount(): void;
  /** Increment recall count. */
  incrementRecallCount(): void;
  /** Check if tenant can store more memories. */
  canStoreMemory(): boolean;
  /** Check if tenant can perform recalls. */
  canRecall(): boolean;
}

/** Default free tier configuration. */
const DEFAULT_FREE_TIER: TenantConfig = {
  maxMemories: 100000,
  maxRecallsPerMonth: 10000,
  consolidationEnabled: true,
  stdpEnabled: true,
};

/** Create a new tenant context. */
export function createTenantContext(
  tenantId: string,
  config?: Partial<TenantConfig>,
): TenantContext {
  const fullConfig: TenantConfig = {
    ...DEFAULT_FREE_TIER,
    ...config,
  };

  return {
    tenantId,
    config: fullConfig,
    currentMemories: 0,
    monthlyRecalls: 0,
    resetMonthlyCounters() {
      this.monthlyRecalls = 0;
    },
    incrementMemoryCount() {
      this.currentMemories++;
    },
    incrementRecallCount() {
      this.monthlyRecalls++;
    },
    canStoreMemory() {
      return this.currentMemories < this.config.maxMemories;
    },
    canRecall() {
      return this.monthlyRecalls < this.config.maxRecallsPerMonth;
    },
  };
}
