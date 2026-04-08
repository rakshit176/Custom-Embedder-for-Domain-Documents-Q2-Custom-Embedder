// tests/unit/tenant-types.test.ts
import { describe, it, expect } from 'vitest';
import { TenantConfig, TenantContext, createTenantContext } from '../../src/lib/memory-engine/tenant-types';

describe('Tenant Types', () => {
  it('should create a tenant context with default config', () => {
    const context = createTenantContext('tenant-123');
    expect(context.tenantId).toBe('tenant-123');
    expect(context.config.maxMemories).toBe(100000);
    expect(context.config.maxRecallsPerMonth).toBe(10000);
  });

  it('should create a tenant context with custom config', () => {
    const customConfig: TenantConfig = {
      maxMemories: 500000,
      maxRecallsPerMonth: 50000,
      consolidationEnabled: true,
      stdpEnabled: true,
    };
    const context = createTenantContext('tenant-456', customConfig);
    expect(context.config.maxMemories).toBe(500000);
  });

  it('should track memory and recall counts', () => {
    const context = createTenantContext('tenant-789');
    context.incrementMemoryCount();
    context.incrementRecallCount();
    expect(context.currentMemories).toBe(1);
    expect(context.monthlyRecalls).toBe(1);
  });

  it('should enforce memory limits', () => {
    const context = createTenantContext('tenant-limit', {
      maxMemories: 2,
      maxRecallsPerMonth: 10,
    });
    context.incrementMemoryCount();
    context.incrementMemoryCount();
    expect(context.canStoreMemory()).toBe(false);
  });

  it('should enforce recall limits', () => {
    const context = createTenantContext('tenant-recall-limit', {
      maxMemories: 100,
      maxRecallsPerMonth: 5,
    });
    for (let i = 0; i < 5; i++) {
      context.incrementRecallCount();
    }
    expect(context.canRecall()).toBe(false);
  });
});
