import { describe, it, expect, beforeEach } from 'vitest';
import { TenantMemorySystem } from '../../src/lib/memory-engine/tenant-memory-system';

describe('TenantMemorySystem', () => {
  let system: TenantMemorySystem;

  beforeEach(() => {
    system = new TenantMemorySystem();
  });

  it('should create isolated memory systems per tenant', () => {
    const mem1 = system.storeForTenant('tenant-1', 'memory for tenant 1');
    const mem2 = system.storeForTenant('tenant-2', 'memory for tenant 2');

    expect(mem1.id).toContain('tenant-1');
    expect(mem2.id).toContain('tenant-2');

    const results1 = system.recallForTenant('tenant-1', 'tenant 1');
    const results2 = system.recallForTenant('tenant-2', 'tenant 2');

    expect(results1).toHaveLength(1);
    expect(results2).toHaveLength(1);
    expect(results1[0].memory.id).toBe(mem1.id);
    expect(results2[0].memory.id).toBe(mem2.id);
  });

  it('should enforce tenant resource limits', () => {
    const context = system.getTenantContext('limited-tenant');
    // Mock limits
    context.config.maxMemories = 2;

    system.storeForTenant('limited-tenant', 'memory 1');
    system.storeForTenant('limited-tenant', 'memory 2');

    expect(() => {
      system.storeForTenant('limited-tenant', 'memory 3');
    }).toThrow('Tenant memory limit exceeded');
  });

  it('should track per-tenant statistics', () => {
    system.storeForTenant('stats-tenant', 'test memory');
    system.recallForTenant('stats-tenant', 'test');

    const stats = system.getStatsForTenant('stats-tenant');
    expect(stats.totalMemories).toBe(1);
    expect(stats.totalRecalls).toBe(1);
  });
});
