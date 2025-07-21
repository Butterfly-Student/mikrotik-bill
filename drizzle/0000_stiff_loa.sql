CREATE TYPE "public"."status" AS ENUM('active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."voucher_status" AS ENUM('unused', 'used', 'expired');--> statement-breakpoint
CREATE TABLE "actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "actions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"key" varchar(255) NOT NULL,
	"permissions" jsonb,
	"is_active" boolean DEFAULT true,
	"last_used" timestamp,
	"expires_at" timestamp,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "api_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "bandwidth_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"router_id" integer NOT NULL,
	"customer_id" integer,
	"username" varchar(50) NOT NULL,
	"session_type" varchar(20) NOT NULL,
	"bytes_in" varchar(50),
	"bytes_out" varchar(50),
	"packets_in" varchar(50),
	"packets_out" varchar(50),
	"recorded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "company_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" varchar(100) NOT NULL,
	"address" text,
	"phone" varchar(20),
	"email" varchar(100),
	"website" varchar(100),
	"logo" varchar(255),
	"currency" varchar(10) DEFAULT 'IDR',
	"timezone" varchar(50) DEFAULT 'Asia/Jakarta',
	"language" varchar(10) DEFAULT 'id',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customer_service_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer,
	"service_plan_id" integer,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"price" numeric(15, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'active',
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(100),
	"password" varchar(255),
	"first_name" varchar(50),
	"last_name" varchar(50),
	"phone" varchar(20),
	"address" text,
	"id_number" varchar(50),
	"birth_date" timestamp,
	"gender" varchar(10),
	"service_plan_id" integer,
	"router_id" integer,
	"status" "status" DEFAULT 'active',
	"balance" numeric(15, 2) DEFAULT '0',
	"registration_date" timestamp DEFAULT now(),
	"last_login" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "customers_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "customers_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "data_usage_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer,
	"router_id" integer NOT NULL,
	"session_type" varchar(20) NOT NULL,
	"total_bytes_in" varchar(50),
	"total_bytes_out" varchar(50),
	"total_packets_in" varchar(50),
	"total_packets_out" varchar(50),
	"session_count" integer DEFAULT 0,
	"total_uptime" integer DEFAULT 0,
	"record_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "financial_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(20) NOT NULL,
	"category" varchar(50) NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"description" text NOT NULL,
	"reference" varchar(100),
	"date" timestamp NOT NULL,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "financial_transactions_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "hotspot_batch" (
	"id" serial PRIMARY KEY NOT NULL,
	"router_id" integer NOT NULL,
	"batch_name" varchar(100) NOT NULL,
	"profile_id" integer,
	"group_id" integer,
	"server_id" integer,
	"total_generated" integer DEFAULT 0,
	"length" integer DEFAULT 6,
	"prefix" varchar(20),
	"characters" varchar(100) DEFAULT 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
	"password_mode" varchar(20) DEFAULT 'same_as_username',
	"comment" text,
	"shared_users" integer DEFAULT 1,
	"disable" boolean DEFAULT false,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hotspot_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"router_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hotspot_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"mikrotik_id" varchar(50),
	"router_id" integer NOT NULL,
	"name" varchar(64) NOT NULL,
	"address_pool" varchar(64),
	"session_timeout" varchar(32),
	"idle_timeout" varchar(32),
	"keepalive_timeout" varchar(32),
	"status_autorefresh" varchar(32),
	"shared_users" integer,
	"rate_limit" varchar(64),
	"add_mac_cookie" boolean,
	"mac_cookie_timeout" varchar(32),
	"address_list" varchar(64),
	"incoming_filter" varchar(64),
	"outgoing_filter" varchar(64),
	"incoming_packet_mark" varchar(64),
	"outgoing_packet_mark" varchar(64),
	"open_status_page" varchar(32),
	"transparent_proxy" boolean,
	"insert_queue_before" varchar(64),
	"parent_queue" varchar(64),
	"queue_type" varchar(64),
	"advertise" boolean,
	"advertise_urls" text,
	"advertise_intervals" text,
	"advertise_timeout" varchar(32),
	"on_login_script" text,
	"on_logout_script" text,
	"service_plan_id" integer,
	"status" "status" DEFAULT 'active',
	"synced_to_mikrotik" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hotspot_server_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"router_id" integer NOT NULL,
	"mikrotik_id" varchar(50),
	"name" varchar(64) NOT NULL,
	"dns_name" varchar(64),
	"html_directory" varchar(128),
	"http_proxy" varchar(64),
	"https_certificate" varchar(64),
	"login_by" varchar(32),
	"split_user_domain" boolean,
	"use_radius" boolean,
	"radius_accounting" boolean,
	"radius_interim_update" varchar(32),
	"radius_location_id" varchar(64),
	"radius_location_name" varchar(64),
	"radius_called_id" varchar(64),
	"smtp_server" varchar(64),
	"is_active" boolean DEFAULT true,
	"synced_to_mikrotik" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hotspot_servers" (
	"id" serial PRIMARY KEY NOT NULL,
	"mikrotik_id" varchar(50),
	"router_id" integer NOT NULL,
	"enabled" boolean DEFAULT true,
	"name" varchar(64) NOT NULL,
	"interface" varchar(32) NOT NULL,
	"address_pool" varchar(64),
	"server_profile_id" integer,
	"idle_timeout" varchar(32),
	"keepalive_timeout" varchar(32),
	"login_timeout" varchar(32),
	"addresses_per_mac" varchar(16),
	"status" "status" DEFAULT 'active',
	"synced_to_mikrotik" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hotspot_user_batch" (
	"user_id" integer NOT NULL,
	"batch_id" integer NOT NULL,
	CONSTRAINT "hotspot_user_batch_user_id_batch_id_pk" PRIMARY KEY("user_id","batch_id")
);
--> statement-breakpoint
CREATE TABLE "hotspot_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"mikrotik_id" varchar(50),
	"router_id" integer NOT NULL,
	"name" varchar(64) NOT NULL,
	"password" varchar(64),
	"comment" text,
	"enabled" boolean DEFAULT true,
	"server_id" integer NOT NULL,
	"profile_id" integer,
	"customer_id" integer,
	"address" varchar(64),
	"mac_address" varchar(17),
	"address_pool" varchar(64),
	"session_timeout" varchar(32),
	"idle_timeout" varchar(32),
	"keepalive_timeout" varchar(32),
	"status_autorefresh" varchar(32),
	"shared_users" integer,
	"rate_limit" varchar(64),
	"add_mac_cookie" boolean,
	"mac_cookie_timeout" varchar(32),
	"address_list" varchar(64),
	"incoming_filter" varchar(64),
	"outgoing_filter" varchar(64),
	"incoming_packet_mark" varchar(64),
	"outgoing_packet_mark" varchar(64),
	"open_status_page" varchar(32),
	"transparent_proxy" boolean,
	"insert_queue_before" varchar(64),
	"parent_queue" varchar(64),
	"queue_type" varchar(64),
	"advertise" boolean,
	"advertise_urls" text,
	"advertise_intervals" text,
	"advertise_timeout" varchar(32),
	"on_login_script" text,
	"on_logout_script" text,
	"limit_uptime" varchar(32),
	"limit_bytes_in" bigint,
	"limit_bytes_out" bigint,
	"limit_bytes_total" bigint,
	"routes" text,
	"email" varchar(128),
	"expiry_date" timestamp,
	"last_login" timestamp,
	"bytes_in" integer DEFAULT 0,
	"bytes_out" integer DEFAULT 0,
	"status" "status" DEFAULT 'active',
	"synced_to_mikrotik" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"customer_id" integer,
	"service_plan_id" integer,
	"amount" numeric(15, 2) NOT NULL,
	"tax" numeric(15, 2) DEFAULT '0',
	"discount" numeric(15, 2) DEFAULT '0',
	"total_amount" numeric(15, 2) NOT NULL,
	"due_date" timestamp NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"paid_at" timestamp,
	"payment_method" varchar(50),
	"description" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_uuid_unique" UNIQUE("uuid"),
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) NOT NULL,
	"content" text NOT NULL,
	"type" varchar(50) DEFAULT 'general',
	"tags" varchar(255),
	"customer_id" integer,
	"router_id" integer,
	"is_private" boolean DEFAULT false,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "notes_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "notification_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"whatsapp_api_url" varchar(255),
	"whatsapp_api_key" varchar(255),
	"whatsapp_from_number" varchar(20),
	"telegram_bot_token" varchar(255),
	"telegram_chat_id" varchar(100),
	"email_smtp_host" varchar(100),
	"email_smtp_port" integer DEFAULT 587,
	"email_smtp_user" varchar(100),
	"email_smtp_password" varchar(255),
	"email_from_address" varchar(100),
	"email_from_name" varchar(100),
	"is_whatsapp_enabled" boolean DEFAULT false,
	"is_telegram_enabled" boolean DEFAULT false,
	"is_email_enabled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(20) NOT NULL,
	"event" varchar(50) NOT NULL,
	"subject" varchar(200),
	"content" text NOT NULL,
	"variables" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"type" varchar(20) NOT NULL,
	"account_number" varchar(100),
	"account_name" varchar(100),
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" integer,
	"customer_id" integer,
	"amount" numeric(15, 2) NOT NULL,
	"method" varchar(50) NOT NULL,
	"reference" varchar(100),
	"status" varchar(20) DEFAULT 'pending',
	"processed_by" integer,
	"processed_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "payments_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"resource_id" integer NOT NULL,
	"action_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "pppoe_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"mikrotik_id" varchar(50),
	"router_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"local_address" varchar(100),
	"remote_address" varchar(100),
	"remote_ipv6_prefix_pool" varchar(100),
	"dhcpv6_pd_pool" varchar(100),
	"bridge" varchar(100),
	"bridge_port_priority" integer,
	"bridge_path_cost" integer,
	"bridge_horizon" integer,
	"bridge_learning" boolean,
	"bridge_port_vid" integer,
	"bridge_port_trusted" boolean,
	"incoming_filter" varchar(100),
	"outgoing_filter" varchar(100),
	"address_list" varchar(100),
	"interface_list" varchar(100),
	"dns_server" varchar(100),
	"wins_server" varchar(100),
	"change_tcp_mss" boolean,
	"use_upnp" boolean,
	"comment" text,
	"use_ipv6" boolean,
	"use_mpls" boolean,
	"use_compression" boolean,
	"use_encryption" boolean,
	"session_timeout" varchar(50),
	"idle_timeout" varchar(50),
	"rate_limit" varchar(100),
	"only_one" boolean,
	"insert_queue_before" varchar(100),
	"parent_queue" varchar(100),
	"queue_type_rx" varchar(100),
	"queue_type_tx" varchar(100),
	"on_up_script" text,
	"on_down_script" text,
	"service_plan_id" integer,
	"is_active" boolean DEFAULT true,
	"synced_to_mikrotik" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pppoe_secrets" (
	"id" serial PRIMARY KEY NOT NULL,
	"mikrotik_id" varchar(50),
	"router_id" integer NOT NULL,
	"enabled" boolean DEFAULT true,
	"name" varchar(100) NOT NULL,
	"password" varchar(100),
	"service" varchar(50),
	"caller_id" varchar(100),
	"profile" varchar(100),
	"local_address" varchar(100),
	"remote_address" varchar(100),
	"remote_ipv6_prefix" varchar(100),
	"routes" text,
	"ipv6_routes" text,
	"limit_bytes_in" bigint,
	"limit_bytes_out" bigint,
	"last_logged_out" timestamp,
	"last_caller_id" varchar(100),
	"last_disconnect_reason" varchar(255),
	"comment" text,
	"customer_id" integer,
	"profile_id" integer,
	"expiry_date" timestamp,
	"status" "status" DEFAULT 'active',
	"synced_to_mikrotik" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "resources_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_id" integer NOT NULL,
	"permission_id" integer NOT NULL,
	"granted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "routers" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"ip_address" varchar(45) NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" varchar(255) NOT NULL,
	"keepalive" boolean DEFAULT true,
	"timeout" integer DEFAULT 300000,
	"port" integer DEFAULT 8728,
	"api_port" integer DEFAULT 8729,
	"location" varchar(100),
	"description" text,
	"is_active" boolean DEFAULT true,
	"last_seen" timestamp,
	"status" varchar(20) DEFAULT 'offline',
	"version" varchar(50),
	"uptime" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "routers_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(50) NOT NULL,
	"description" text,
	"cron_expression" varchar(100) NOT NULL,
	"command" text,
	"parameters" jsonb,
	"is_active" boolean DEFAULT true,
	"last_run" timestamp,
	"next_run" timestamp,
	"run_count" integer DEFAULT 0,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "schedules_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "service_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(20) NOT NULL,
	"price" numeric(15, 2) NOT NULL,
	"bandwidth" varchar(50),
	"download_speed" integer,
	"upload_speed" integer,
	"data_limit" integer,
	"time_limit" integer,
	"validity" integer DEFAULT 30,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "service_plans_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "system_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"level" varchar(20) NOT NULL,
	"message" text NOT NULL,
	"context" jsonb,
	"user_id" integer,
	"ip_address" varchar(45),
	"user_agent" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "task_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer,
	"user_id" integer,
	"comment" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"type" varchar(50) NOT NULL,
	"priority" varchar(20) DEFAULT 'medium',
	"status" varchar(20) DEFAULT 'pending',
	"assigned_to" integer,
	"customer_id" integer,
	"router_id" integer,
	"due_date" timestamp,
	"completed_at" timestamp,
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tasks_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"assigned_by" integer,
	"assigned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"name" varchar(255),
	"image" text,
	"email_verified" timestamp,
	"first_name" varchar(50),
	"last_name" varchar(50),
	"phone" varchar(20),
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "vouchers" (
	"id" serial PRIMARY KEY NOT NULL,
	"mikrotik_id" varchar(50),
	"router_id" integer NOT NULL,
	"code" varchar(50) NOT NULL,
	"profile_id" integer,
	"server_id" integer,
	"batch_id" integer,
	"validity_period" integer,
	"price" numeric(10, 2),
	"created_by" integer,
	"used_by" varchar(100),
	"used_at" timestamp,
	"expiry_date" timestamp,
	"status" "voucher_status" DEFAULT 'unused',
	"synced_to_mikrotik" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandwidth_usage" ADD CONSTRAINT "bandwidth_usage_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "public"."routers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bandwidth_usage" ADD CONSTRAINT "bandwidth_usage_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_service_history" ADD CONSTRAINT "customer_service_history_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_service_history" ADD CONSTRAINT "customer_service_history_service_plan_id_service_plans_id_fk" FOREIGN KEY ("service_plan_id") REFERENCES "public"."service_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_service_plan_id_service_plans_id_fk" FOREIGN KEY ("service_plan_id") REFERENCES "public"."service_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "public"."routers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_usage_history" ADD CONSTRAINT "data_usage_history_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_usage_history" ADD CONSTRAINT "data_usage_history_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "public"."routers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotspot_batch" ADD CONSTRAINT "hotspot_batch_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "public"."routers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotspot_batch" ADD CONSTRAINT "hotspot_batch_profile_id_hotspot_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."hotspot_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotspot_batch" ADD CONSTRAINT "hotspot_batch_group_id_hotspot_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."hotspot_groups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotspot_batch" ADD CONSTRAINT "hotspot_batch_server_id_hotspot_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."hotspot_servers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotspot_batch" ADD CONSTRAINT "hotspot_batch_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotspot_groups" ADD CONSTRAINT "hotspot_groups_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "public"."routers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotspot_profiles" ADD CONSTRAINT "hotspot_profiles_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "public"."routers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotspot_profiles" ADD CONSTRAINT "hotspot_profiles_service_plan_id_service_plans_id_fk" FOREIGN KEY ("service_plan_id") REFERENCES "public"."service_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotspot_server_profiles" ADD CONSTRAINT "hotspot_server_profiles_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "public"."routers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotspot_servers" ADD CONSTRAINT "hotspot_servers_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "public"."routers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotspot_servers" ADD CONSTRAINT "hotspot_servers_server_profile_id_hotspot_server_profiles_id_fk" FOREIGN KEY ("server_profile_id") REFERENCES "public"."hotspot_server_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotspot_user_batch" ADD CONSTRAINT "hotspot_user_batch_user_id_hotspot_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."hotspot_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotspot_user_batch" ADD CONSTRAINT "hotspot_user_batch_batch_id_hotspot_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."hotspot_batch"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotspot_users" ADD CONSTRAINT "hotspot_users_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "public"."routers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotspot_users" ADD CONSTRAINT "hotspot_users_server_id_hotspot_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."hotspot_servers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotspot_users" ADD CONSTRAINT "hotspot_users_profile_id_hotspot_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."hotspot_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hotspot_users" ADD CONSTRAINT "hotspot_users_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_service_plan_id_service_plans_id_fk" FOREIGN KEY ("service_plan_id") REFERENCES "public"."service_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "public"."routers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_action_id_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."actions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pppoe_profiles" ADD CONSTRAINT "pppoe_profiles_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "public"."routers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pppoe_profiles" ADD CONSTRAINT "pppoe_profiles_service_plan_id_service_plans_id_fk" FOREIGN KEY ("service_plan_id") REFERENCES "public"."service_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pppoe_secrets" ADD CONSTRAINT "pppoe_secrets_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "public"."routers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pppoe_secrets" ADD CONSTRAINT "pppoe_secrets_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pppoe_secrets" ADD CONSTRAINT "pppoe_secrets_profile_id_pppoe_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."pppoe_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_logs" ADD CONSTRAINT "system_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "public"."routers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_router_id_routers_id_fk" FOREIGN KEY ("router_id") REFERENCES "public"."routers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_profile_id_hotspot_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."hotspot_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_server_id_hotspot_servers_id_fk" FOREIGN KEY ("server_id") REFERENCES "public"."hotspot_servers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_batch_id_hotspot_batch_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."hotspot_batch"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "api_keys_key_idx" ON "api_keys" USING btree ("key");--> statement-breakpoint
CREATE INDEX "api_keys_active_idx" ON "api_keys" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "api_keys_expires_idx" ON "api_keys" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "bandwidth_usage_router_idx" ON "bandwidth_usage" USING btree ("router_id");--> statement-breakpoint
CREATE INDEX "bandwidth_usage_customer_idx" ON "bandwidth_usage" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "bandwidth_usage_username_idx" ON "bandwidth_usage" USING btree ("username");--> statement-breakpoint
CREATE INDEX "bandwidth_usage_type_idx" ON "bandwidth_usage" USING btree ("session_type");--> statement-breakpoint
CREATE INDEX "bandwidth_usage_recorded_at_idx" ON "bandwidth_usage" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX "customer_service_history_customer_idx" ON "customer_service_history" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "customer_service_history_service_plan_idx" ON "customer_service_history" USING btree ("service_plan_id");--> statement-breakpoint
CREATE INDEX "customer_service_history_date_idx" ON "customer_service_history" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "customers_username_idx" ON "customers" USING btree ("username");--> statement-breakpoint
CREATE INDEX "customers_email_idx" ON "customers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "customers_phone_idx" ON "customers" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "customers_status_idx" ON "customers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "customers_service_plan_idx" ON "customers" USING btree ("service_plan_id");--> statement-breakpoint
CREATE INDEX "customers_router_idx" ON "customers" USING btree ("router_id");--> statement-breakpoint
CREATE INDEX "data_usage_history_customer_idx" ON "data_usage_history" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "data_usage_history_router_idx" ON "data_usage_history" USING btree ("router_id");--> statement-breakpoint
CREATE INDEX "data_usage_history_date_idx" ON "data_usage_history" USING btree ("record_date");--> statement-breakpoint
CREATE INDEX "data_usage_history_type_idx" ON "data_usage_history" USING btree ("session_type");--> statement-breakpoint
CREATE INDEX "financial_transactions_type_idx" ON "financial_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "financial_transactions_category_idx" ON "financial_transactions" USING btree ("category");--> statement-breakpoint
CREATE INDEX "financial_transactions_date_idx" ON "financial_transactions" USING btree ("date");--> statement-breakpoint
CREATE INDEX "financial_transactions_amount_idx" ON "financial_transactions" USING btree ("amount");--> statement-breakpoint
CREATE INDEX "hotspot_batch_name_router_idx" ON "hotspot_batch" USING btree ("batch_name","router_id");--> statement-breakpoint
CREATE INDEX "hotspot_batch_profile_idx" ON "hotspot_batch" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "hotspot_batch_created_by_idx" ON "hotspot_batch" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "hotspot_batch_router_idx" ON "hotspot_batch" USING btree ("router_id");--> statement-breakpoint
CREATE INDEX "hotspot_groups_name_router_idx" ON "hotspot_groups" USING btree ("name","router_id");--> statement-breakpoint
CREATE INDEX "hotspot_groups_router_idx" ON "hotspot_groups" USING btree ("router_id");--> statement-breakpoint
CREATE INDEX "hotspot_groups_active_idx" ON "hotspot_groups" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "hotspot_profiles_name_router_idx" ON "hotspot_profiles" USING btree ("name","router_id");--> statement-breakpoint
CREATE INDEX "hotspot_profiles_advertise_idx" ON "hotspot_profiles" USING btree ("advertise");--> statement-breakpoint
CREATE INDEX "hotspot_profiles_mikrotik_idx" ON "hotspot_profiles" USING btree ("mikrotik_id");--> statement-breakpoint
CREATE INDEX "hotspot_profiles_router_idx" ON "hotspot_profiles" USING btree ("router_id");--> statement-breakpoint
CREATE INDEX "hotspot_profiles_service_plan_idx" ON "hotspot_profiles" USING btree ("service_plan_id");--> statement-breakpoint
CREATE INDEX "hotspot_server_profiles_name_router_idx" ON "hotspot_server_profiles" USING btree ("name","router_id");--> statement-breakpoint
CREATE INDEX "hotspot_server_profiles_mikrotik_idx" ON "hotspot_server_profiles" USING btree ("mikrotik_id");--> statement-breakpoint
CREATE INDEX "hotspot_server_profiles_router_idx" ON "hotspot_server_profiles" USING btree ("router_id");--> statement-breakpoint
CREATE INDEX "hotspot_servers_name_router_idx" ON "hotspot_servers" USING btree ("name","router_id");--> statement-breakpoint
CREATE INDEX "hotspot_servers_interface_idx" ON "hotspot_servers" USING btree ("interface");--> statement-breakpoint
CREATE INDEX "hotspot_servers_enabled_idx" ON "hotspot_servers" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "hotspot_servers_mikrotik_idx" ON "hotspot_servers" USING btree ("mikrotik_id");--> statement-breakpoint
CREATE INDEX "hotspot_servers_router_idx" ON "hotspot_servers" USING btree ("router_id");--> statement-breakpoint
CREATE INDEX "hotspot_users_name_router_idx" ON "hotspot_users" USING btree ("name","router_id");--> statement-breakpoint
CREATE INDEX "hotspot_users_server_idx" ON "hotspot_users" USING btree ("server_id");--> statement-breakpoint
CREATE INDEX "hotspot_users_profile_idx" ON "hotspot_users" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "hotspot_users_enabled_idx" ON "hotspot_users" USING btree ("enabled");--> statement-breakpoint
CREATE INDEX "hotspot_users_customer_idx" ON "hotspot_users" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "hotspot_users_status_idx" ON "hotspot_users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "hotspot_users_expiry_idx" ON "hotspot_users" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "hotspot_users_mikrotik_idx" ON "hotspot_users" USING btree ("mikrotik_id");--> statement-breakpoint
CREATE INDEX "hotspot_users_router_idx" ON "hotspot_users" USING btree ("router_id");--> statement-breakpoint
CREATE INDEX "invoices_customer_idx" ON "invoices" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "invoices_status_idx" ON "invoices" USING btree ("status");--> statement-breakpoint
CREATE INDEX "invoices_due_date_idx" ON "invoices" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "invoices_number_idx" ON "invoices" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX "notes_type_idx" ON "notes" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notes_customer_idx" ON "notes" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "notes_router_idx" ON "notes" USING btree ("router_id");--> statement-breakpoint
CREATE INDEX "notes_created_by_idx" ON "notes" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "notes_date_idx" ON "notes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notification_templates_type_idx" ON "notification_templates" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notification_templates_event_idx" ON "notification_templates" USING btree ("event");--> statement-breakpoint
CREATE INDEX "notification_templates_active_idx" ON "notification_templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "payment_methods_type_idx" ON "payment_methods" USING btree ("type");--> statement-breakpoint
CREATE INDEX "payment_methods_active_idx" ON "payment_methods" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "payments_invoice_idx" ON "payments" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "payments_customer_idx" ON "payments" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_method_idx" ON "payments" USING btree ("method");--> statement-breakpoint
CREATE INDEX "payments_date_idx" ON "payments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "pppoe_profiles_name_router_idx" ON "pppoe_profiles" USING btree ("name","router_id");--> statement-breakpoint
CREATE INDEX "pppoe_profiles_mikrotik_idx" ON "pppoe_profiles" USING btree ("mikrotik_id");--> statement-breakpoint
CREATE INDEX "pppoe_profiles_router_idx" ON "pppoe_profiles" USING btree ("router_id");--> statement-breakpoint
CREATE INDEX "pppoe_profiles_service_plan_idx" ON "pppoe_profiles" USING btree ("service_plan_id");--> statement-breakpoint
CREATE INDEX "pppoe_profiles_active_idx" ON "pppoe_profiles" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "pppoe_secrets_name_router_idx" ON "pppoe_secrets" USING btree ("name","router_id");--> statement-breakpoint
CREATE INDEX "pppoe_secrets_mikrotik_idx" ON "pppoe_secrets" USING btree ("mikrotik_id");--> statement-breakpoint
CREATE INDEX "pppoe_secrets_customer_idx" ON "pppoe_secrets" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "pppoe_secrets_router_idx" ON "pppoe_secrets" USING btree ("router_id");--> statement-breakpoint
CREATE INDEX "pppoe_secrets_profile_idx" ON "pppoe_secrets" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "pppoe_secrets_status_idx" ON "pppoe_secrets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "pppoe_secrets_expiry_idx" ON "pppoe_secrets" USING btree ("expiry_date");--> statement-breakpoint
CREATE INDEX "role_permissions_role_id_idx" ON "role_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX "routers_ip_idx" ON "routers" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "routers_status_idx" ON "routers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "routers_active_idx" ON "routers" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "schedules_type_idx" ON "schedules" USING btree ("type");--> statement-breakpoint
CREATE INDEX "schedules_active_idx" ON "schedules" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "schedules_next_run_idx" ON "schedules" USING btree ("next_run");--> statement-breakpoint
CREATE INDEX "service_plans_type_idx" ON "service_plans" USING btree ("type");--> statement-breakpoint
CREATE INDEX "service_plans_active_idx" ON "service_plans" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "service_plans_price_idx" ON "service_plans" USING btree ("price");--> statement-breakpoint
CREATE INDEX "system_logs_level_idx" ON "system_logs" USING btree ("level");--> statement-breakpoint
CREATE INDEX "system_logs_user_idx" ON "system_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "system_logs_date_idx" ON "system_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "task_comments_task_idx" ON "task_comments" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "task_comments_user_idx" ON "task_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "task_comments_date_idx" ON "task_comments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tasks_assigned_idx" ON "tasks" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tasks_priority_idx" ON "tasks" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "tasks_type_idx" ON "tasks" USING btree ("type");--> statement-breakpoint
CREATE INDEX "tasks_due_date_idx" ON "tasks" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "tasks_customer_idx" ON "tasks" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "user_roles_user_id_idx" ON "user_roles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_roles_role_id_idx" ON "user_roles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "vouchers_code_router_idx" ON "vouchers" USING btree ("code","router_id");--> statement-breakpoint
CREATE INDEX "vouchers_status_idx" ON "vouchers" USING btree ("status");--> statement-breakpoint
CREATE INDEX "vouchers_created_by_idx" ON "vouchers" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "vouchers_batch_idx" ON "vouchers" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "vouchers_mikrotik_idx" ON "vouchers" USING btree ("mikrotik_id");--> statement-breakpoint
CREATE INDEX "vouchers_router_idx" ON "vouchers" USING btree ("router_id");