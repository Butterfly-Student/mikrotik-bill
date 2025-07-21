import {
	pgTable,
	serial,
	varchar,
	decimal,
	boolean,
	timestamp,
	integer,
	text,
	bigint,
	inet,
	index,
} from "drizzle-orm/pg-core";
import { expiredModeEnum, profileTypeEnum, statusEnum, userStatusEnum, voucherStatusEnum } from "./enum";
import { users } from "./users";
import { customers, resellers } from "./system";


// ===== PROFILE MANAGEMENT =====

// Unified profiles table for both hotspot and pppoe
export const profiles = pgTable(
	"profiles",
	{
		id: serial("id").primaryKey(),
		name: varchar("name", { length: 100 }).notNull(),
		type: profileTypeEnum("type").notNull(),
		time_limit: integer("time_limit"), // in seconds
		data_limit: bigint("data_limit", { mode: "number" }), // in bytes
		quota_limit: bigint("quota_limit", { mode: "number" }), // in bytes
		bandwidth_up: integer("bandwidth_up"), // in kbps
		bandwidth_down: integer("bandwidth_down"), // in kbps
		validity_days: integer("validity_days"),
		price: decimal("price", { precision: 10, scale: 2 }),
		billing_cycle: varchar("billing_cycle", { length: 20 }).default("monthly"),
		expired_mode: expiredModeEnum("expired_mode").default("remove"),
		grace_period_days: integer("grace_period_days").default(0),
		is_shared_bandwidth: boolean("is_shared_bandwidth").default(false),
		is_active: boolean("is_active").default(true),
		// Additional fields for PPPoE
		local_address: varchar("local_address", { length: 50 }),
		remote_address: varchar("remote_address", { length: 50 }),
		session_timeout: integer("session_timeout"),
		idle_timeout: integer("idle_timeout"),
		only_one: boolean("only_one").default(false),
		// Additional fields for Hotspot
		address_pool: varchar("address_pool", { length: 100 }),
		transparent_proxy: boolean("transparent_proxy").default(false),
		shared_users: integer("shared_users").default(1),
		comment: text("comment"),
		created_by: integer("created_by").references(() => users.id),
		created_at: timestamp("created_at").defaultNow(),
		updated_at: timestamp("updated_at").defaultNow(),
	},
	(table) => [
		index("idx_profiles_name").on(table.name),
		index("idx_profiles_type").on(table.type),
		index("idx_profiles_status").on(table.is_active),
	]
);

// ===== HOTSPOT MANAGEMENT =====

export const hotspotUsers = pgTable(
	"hotspot_users",
	{
		id: serial("id").primaryKey(),
		username: varchar("username", { length: 50 }).unique().notNull(),
		password: varchar("password", { length: 50 }).notNull(),
		profile_id: integer("profile_id").references(() => profiles.id),
		customer_id: integer("customer_id").references(() => customers.id),
		mac_address: varchar("mac_address", { length: 17 }),
		time_used: integer("time_used").default(0),
		data_used: bigint("data_used", { mode: "number" }).default(0),
		quota_used: bigint("quota_used", { mode: "number" }).default(0),
		status: userStatusEnum("status").default("active"),
		comment: text("comment"),
		created_by: integer("created_by").references(() => users.id),
		reseller_id: integer("reseller_id").references(() => resellers.id),
		expires_at: timestamp("expires_at"),
		last_login: timestamp("last_login"),
		created_at: timestamp("created_at").defaultNow(),
		updated_at: timestamp("updated_at").defaultNow(),
	},
	(table) => [
		index("idx_hotspot_users_username").on(table.username),
		index("idx_hotspot_users_status").on(table.status),
		index("idx_hotspot_users_reseller").on(table.reseller_id),
		index("idx_hotspot_users_customer").on(table.customer_id),
	]
);

// ===== PPPOE MANAGEMENT =====

export const pppoeUsers = pgTable(
	"pppoe_users",
	{
		id: serial("id").primaryKey(),
		username: varchar("username", { length: 50 }).unique().notNull(),
		password: varchar("password", { length: 50 }).notNull(),
		profile_id: integer("profile_id").references(() => profiles.id),
		customer_id: integer("customer_id").references(() => customers.id),
		static_ip: inet("static_ip"),
		interface_name: varchar("interface_name", { length: 50 }),
		service: varchar("service", { length: 50 }).default("pppoe"),
		caller_id: varchar("caller_id", { length: 50 }),
		time_used: integer("time_used").default(0),
		data_used: bigint("data_used", { mode: "number" }).default(0),
		status: userStatusEnum("status").default("active"),
		comment: text("comment"),
		disabled: boolean("disabled").default(false),
		created_by: integer("created_by").references(() => users.id),
		reseller_id: integer("reseller_id").references(() => resellers.id),
		expires_at: timestamp("expires_at"),
		last_login: timestamp("last_login"),
		created_at: timestamp("created_at").defaultNow(),
		updated_at: timestamp("updated_at").defaultNow(),
	},
	(table) => 
		[index("idx_pppoe_users_username").on(table.username),
		index("idx_pppoe_users_status").on(table.status),
		index("idx_pppoe_users_reseller").on(table.reseller_id),
		index("idx_pppoe_users_customer").on(table.customer_id),
		]
);

// ===== VOUCHER MANAGEMENT =====

export const voucherBatches = pgTable("voucher_batches", {
	id: serial("id").primaryKey(),
	batch_name: varchar("batch_name", { length: 100 }).notNull(),
	prefix: varchar("prefix", { length: 20 }),
	quantity: integer("quantity").notNull(),
	profile_id: integer("profile_id").references(() => profiles.id),
	username_length: integer("username_length").default(6),
	password_length: integer("password_length").default(6),
	validity_days: integer("validity_days").default(30),
	unit_price: decimal("unit_price", { precision: 10, scale: 2 }),
	created_by: integer("created_by").references(() => users.id),
	created_at: timestamp("created_at").defaultNow(),
});

export const vouchers = pgTable(
	"vouchers",
	{
		id: serial("id").primaryKey(),
		batch_id: integer("batch_id").references(() => voucherBatches.id),
		username: varchar("username", { length: 50 }).unique().notNull(),
		password: varchar("password", { length: 50 }).notNull(),
		profile_id: integer("profile_id").references(() => profiles.id),
		status: voucherStatusEnum("status").default("unused"),
		created_by: integer("created_by").references(() => users.id),
		reseller_id: integer("reseller_id").references(() => resellers.id),
		reseller_order_id: integer("reseller_order_id"),
		used_at: timestamp("used_at"),
		expires_at: timestamp("expires_at"),
		created_at: timestamp("created_at").defaultNow(),
	},
	(table) => 
		[index("idx_vouchers_username").on(table.username),
		index("idx_vouchers_batch").on(table.batch_id),
		index("idx_vouchers_status").on(table.status),
		index("idx_vouchers_reseller_order").on(
			table.reseller_order_id
		),
	]
);

export const voucherOrders = pgTable(
	"voucher_orders",
	{
		id: serial("id").primaryKey(),
		order_number: varchar("order_number", { length: 50 }).unique().notNull(),
		reseller_id: integer("reseller_id").references(() => resellers.id),
		profile_id: integer("profile_id").references(() => profiles.id),
		quantity: integer("quantity").notNull(),
		prefix: varchar("prefix", { length: 20 }),
		username_length: integer("username_length").default(6),
		password_length: integer("password_length").default(6),
		unit_price: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
		total_amount: decimal("total_amount", {
			precision: 10,
			scale: 2,
		}).notNull(),
		status: statusEnum("status").default("pending"),
		payment_method: varchar("payment_method", { length: 50 }),
		payment_proof: text("payment_proof"),
		notes: text("notes"),
		expires_at: timestamp("expires_at"),
		paid_at: timestamp("paid_at"),
		generated_at: timestamp("generated_at"),
		created_at: timestamp("created_at").defaultNow(),
		updated_at: timestamp("updated_at").defaultNow(),
	},
	(table) => [
		index("idx_voucher_orders_reseller").on(table.reseller_id),
		index("idx_voucher_orders_status").on(table.status),
	]
);



export const allTables = {
	// Core entities
	customers,
	resellers,
	users,

	// Profile and user management
	profiles,
	hotspotUsers,
	pppoeUsers,

	// Voucher management
	voucherBatches,
	vouchers,
	voucherOrders,

};
