/**
 * Multi-tenant wrapper for BrainMemorySystem.
 * Provides tenant isolation and resource management.
 */

import { BrainMemorySystem } from './memory-system';
import { MemoryItem, RecallResult, MemorySystemStats } from './types';
import { TenantContext, createTenantContext, TenantConfig } from './tenant-types';

export class TenantMemorySystem {
  /** Map of tenant ID to their isolated memory system. */
  private readonly tenantSystems: Map<string, {
    system: BrainMemorySystem;
    context: TenantContext;
  }>;

  constructor() {
    this.tenantSystems = new Map();
  }

  /**
   * Get or create a tenant's memory system and context.
   */
  private getTenantSystem(tenantId: string): {
    system: BrainMemorySystem;
    context: TenantContext;
  } {
    let entry = this.tenantSystems.get(tenantId);
    if (!entry) {
      entry = {
        system: new BrainMemorySystem(),
        context: createTenantContext(tenantId),
      };
      this.tenantSystems.set(tenantId, entry);
    }
    return entry;
  }

  /**
   * Get a tenant's context, creating if it doesn't exist.
   */
  getTenantContext(tenantId: string): TenantContext {
    const entry = this.getTenantSystem(tenantId);
    return entry.context;
  }

  /**
   * Store a memory for a specific tenant.
   * @throws Error if tenant's memory limit is exceeded.
   */
  storeForTenant(
    tenantId: string,
    content: string,
    metadata?: Record<string, unknown>,
  ): MemoryItem {
    const { system, context } = this.getTenantSystem(tenantId);

    if (!context.canStoreMemory()) {
      throw new Error(`Tenant memory limit exceeded: ${context.currentMemories}/${context.config.maxMemories}`);
    }

    const memory = system.store(content, {
      ...metadata,
      tenantId,
    });

    context.incrementMemoryCount();

    // Return a modified copy with tenant-prefixed ID for API consumers
    return {
      ...memory,
      id: `${tenantId}-${memory.id}`,
    };
  }

  /**
   * Recall memories for a specific tenant.
   * @throws Error if tenant's recall limit is exceeded.
   */
  recallForTenant(
    tenantId: string,
    query: string,
  ): RecallResult[] {
    const { system, context } = this.getTenantSystem(tenantId);

    if (!context.canRecall()) {
      throw new Error(`Tenant recall limit exceeded: ${context.monthlyRecalls}/${context.config.maxRecallsPerMonth}`);
    }

    const results = system.recall(query);
    context.incrementRecallCount();

    // Filter results to only this tenant's memories and add tenant prefix to IDs
    return results
      .filter(r => r.memory.metadata?.tenantId === tenantId)
      .map(r => ({
        ...r,
        memory: {
          ...r.memory,
          id: `${tenantId}-${r.memory.id}`,
        },
      }));
  }

  /**
   * Get statistics for a specific tenant.
   */
  getStatsForTenant(tenantId: string): MemorySystemStats & {
    currentMemories: number;
    monthlyRecalls: number;
  } {
    const { system, context } = this.getTenantSystem(tenantId);
    const stats = system.getStats();
    return {
      ...stats,
      currentMemories: context.currentMemories,
      monthlyRecalls: context.monthlyRecalls,
    };
  }

  /**
   * Remove a tenant and all their data.
   */
  removeTenant(tenantId: string): boolean {
    const entry = this.tenantSystems.get(tenantId);
    if (!entry) return false;

    entry.system.reset();
    return this.tenantSystems.delete(tenantId);
  }

  /**
   * Get all registered tenant IDs.
   */
  getTenantIds(): string[] {
    return Array.from(this.tenantSystems.keys());
  }
}
