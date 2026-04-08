CREATE TABLE "memories" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb,
	"tags" text[],
	"index_code" jsonb NOT NULL,
	"index_sparsity" real NOT NULL,
	"embedding" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_recalled_at" timestamp,
	"recall_count" integer DEFAULT 0 NOT NULL,
	"consolidation_level" real DEFAULT 0 NOT NULL,
	"hippocampal_strength" real DEFAULT 1 NOT NULL,
	"neocortical_strength" real DEFAULT 0.1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recall_events" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"query" text NOT NULL,
	"results_count" integer NOT NULL,
	"avg_confidence" real,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"hopfield_iterations" integer,
	"from_neocortex" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stdp_associations" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"source_id" text NOT NULL,
	"target_id" text NOT NULL,
	"weight" real NOT NULL,
	"type" text NOT NULL,
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"reinforcement_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"max_memories" integer DEFAULT 100000 NOT NULL,
	"max_recalls_per_month" integer DEFAULT 10000 NOT NULL,
	"consolidation_enabled" boolean DEFAULT true NOT NULL,
	"stdp_enabled" boolean DEFAULT true NOT NULL,
	"current_memories" integer DEFAULT 0 NOT NULL,
	"monthly_recalls" integer DEFAULT 0 NOT NULL,
	"plan" text DEFAULT 'free' NOT NULL,
	"stripe_customer_id" text
);
--> statement-breakpoint
ALTER TABLE "memories" ADD CONSTRAINT "memories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recall_events" ADD CONSTRAINT "recall_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stdp_associations" ADD CONSTRAINT "stdp_associations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stdp_associations" ADD CONSTRAINT "stdp_associations_source_id_memories_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."memories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stdp_associations" ADD CONSTRAINT "stdp_associations_target_id_memories_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."memories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "memories_tenant_idx" ON "memories" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "memories_consolidation_idx" ON "memories" USING btree ("consolidation_level");--> statement-breakpoint
CREATE INDEX "memories_created_at_idx" ON "memories" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "recall_events_tenant_idx" ON "recall_events" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "recall_events_timestamp_idx" ON "recall_events" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "stdp_tenant_idx" ON "stdp_associations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "stdp_source_idx" ON "stdp_associations" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "stdp_target_idx" ON "stdp_associations" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "stdp_weight_idx" ON "stdp_associations" USING btree ("weight");--> statement-breakpoint
CREATE INDEX "tenants_plan_idx" ON "tenants" USING btree ("plan");