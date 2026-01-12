CREATE TABLE "bill_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"bill_id" integer NOT NULL,
	"type" text NOT NULL,
	"description" text,
	"amount" numeric(12, 0) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leases" (
	"id" serial PRIMARY KEY NOT NULL,
	"unit_id" integer NOT NULL,
	"tenant_id" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"deposit" numeric(12, 0),
	"rent_price" numeric(12, 0),
	"occupant_count" integer DEFAULT 1,
	"active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "monthly_bills" (
	"id" serial PRIMARY KEY NOT NULL,
	"unit_id" integer NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"electric_start" integer,
	"electric_end" integer,
	"electric_rate" numeric(12, 0),
	"water_usage" integer,
	"water_rate" numeric(12, 0),
	"total_amount" numeric(12, 0) NOT NULL,
	"paid_amount" numeric(12, 0) DEFAULT '0',
	"status" text DEFAULT 'unpaid',
	"note" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"electric_id" text,
	"water_id" text,
	CONSTRAINT "properties_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"identity_card" text
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"name" text NOT NULL,
	"floor" integer,
	"base_price" numeric(12, 0)
);
--> statement-breakpoint
ALTER TABLE "bill_items" ADD CONSTRAINT "bill_items_bill_id_monthly_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."monthly_bills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leases" ADD CONSTRAINT "leases_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leases" ADD CONSTRAINT "leases_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_bills" ADD CONSTRAINT "monthly_bills_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "bill_unit_month_idx" ON "monthly_bills" USING btree ("unit_id","month","year");--> statement-breakpoint
CREATE UNIQUE INDEX "unit_property_idx" ON "units" USING btree ("property_id","name");