// src/lib/persistence/schema.ts
import { pgTable, text, timestamp, real, integer, jsonb, index, boolean } from 'drizzle-orm/pg-core';

/**
 * Tenants table - stores tenant configuration and limits.
 */
export const tenants = pgTable('tenants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  // Resource limits
  maxMemories: integer('max_memories').notNull().default(100000),
  maxRecallsPerMonth: integer('max_recalls_per_month').notNull().default(10000),

  // Feature flags
  consolidationEnabled: boolean('consolidation_enabled').notNull().default(true),
  stdpEnabled: boolean('stdp_enabled').notNull().default(true),

  // Current usage
  currentMemories: integer('current_memories').notNull().default(0),
  monthlyRecalls: integer('monthly_recalls').notNull().default(0),

  // Billing
  plan: text('plan').notNull().default('free'), // 'free', 'pro', 'enterprise'
  stripeCustomerId: text('stripe_customer_id'),
}, (table) => ({
    planIdx: index('tenants_plan_idx').on(table.plan),
  }));

/**
 * Memories table - stores all memory items with embeddings.
 */
export const memories = pgTable('memories', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),

  // Content
  content: text('content').notNull(),
  metadata: jsonb('metadata'),
  tags: text('tags').array(),

  // Index codes (sparse bipolar vectors as JSON arrays)
  indexCode: jsonb('index_code').notNull(),
  indexSparsity: real('index_sparsity').notNull(),

  // Embeddings (dense vectors for pgvector)
  // Note: pgvector extension will be set up separately
  // For now, using jsonb to store vector arrays
  embedding: jsonb('embedding').notNull(), // Will use pgvector

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastRecalledAt: timestamp('last_recalled_at'),

  // Statistics
  recallCount: integer('recall_count').notNull().default(0),

  // Consolidation state
  consolidationLevel: real('consolidation_level').notNull().default(0),
  hippocampalStrength: real('hippocampal_strength').notNull().default(1.0),
  neocorticalStrength: real('neocortical_strength').notNull().default(0.1),
}, (table) => ({
    tenantIdx: index('memories_tenant_idx').on(table.tenantId),
    consolidationIdx: index('memories_consolidation_idx').on(table.consolidationLevel),
    createdAtIdx: index('memories_created_at_idx').on(table.createdAt),
  }));

/**
 * STDP associations table - temporal memory connections.
 */
export const stdpAssociations = pgTable('stdp_associations', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),

  sourceId: text('source_id').notNull().references(() => memories.id, { onDelete: 'cascade' }),
  targetId: text('target_id').notNull().references(() => memories.id, { onDelete: 'cascade' }),

  weight: real('weight').notNull(),
  type: text('type').notNull(), // 'temporal', 'semantic', 'episodic'

  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
  reinforcementCount: integer('reinforcement_count').notNull().default(0),
}, (table) => ({
    tenantIdx: index('stdp_tenant_idx').on(table.tenantId),
    sourceIdx: index('stdp_source_idx').on(table.sourceId),
    targetIdx: index('stdp_target_idx').on(table.targetId),
    weightIdx: index('stdp_weight_idx').on(table.weight),
  }));

/**
 * Recall events table - for analytics and billing.
 */
export const recallEvents = pgTable('recall_events', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),

  query: text('query').notNull(),
  resultsCount: integer('results_count').notNull(),
  avgConfidence: real('avg_confidence'),

  timestamp: timestamp('timestamp').defaultNow().notNull(),

  // Performance metrics
  hopfieldIterations: integer('hopfield_iterations'),
  fromNeocortex: boolean('from_neocortex').notNull().default(false),
}, (table) => ({
    tenantIdx: index('recall_events_tenant_idx').on(table.tenantId),
    timestampIdx: index('recall_events_timestamp_idx').on(table.timestamp),
  }));
