import {
	pgTable,
	text,
	varchar,
	integer,
	decimal,
	timestamp,
	boolean,
	serial,
	uuid,
	jsonb,
	index,
	bigint,
	pgEnum,
	primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============ ENUMS ============
export const statusEnum = pgEnum("status", ["active", "inactive", "suspended"]);
export const voucherStatusEnum = pgEnum("voucher_status", [
	"unused",
	"used",
	"expired",
]);

// ============ CORE SYSTEM TABLES ============
// Users & Authentication
// Users table
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    username: varchar("username", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }),
    image: text("image"),
    emailVerified: timestamp("email_verified"),
    first_name: varchar("first_name", { length: 50 }),
    last_name: varchar("last_name", { length: 50 }),
    phone: varchar("phone", { length: 20 }),
    role: varchar("role", { length: 20 }).notNull().default("user"), // admin, operator, user
    is_active: boolean("is_active").default(true),
    last_login: timestamp("last_login"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("users_email_idx").on(table.email),
    index("users_username_idx").on(table.username),
  ]
);

// Roles table
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Resources table
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Actions table
export const actions = pgTable("actions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Permissions table (now references resources and actions)
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  resourceId: integer("resource_id")
    .references(() => resources.id, { onDelete: "cascade" })
    .notNull(),
  actionId: integer("action_id")
    .references(() => actions.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User roles junction table
export const userRoles = pgTable(
  "user_roles",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    roleId: integer("role_id")
      .references(() => roles.id, { onDelete: "cascade" })
      .notNull(),
    assigned_by: integer("assigned_by").references(() => users.id),
    assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  },
  (table) => ([
    index("user_roles_user_id_idx").on(table.userId),
    index("user_roles_role_id_idx").on(table.roleId),
  ])
);

// Role permissions junction table
export const rolePermissions = pgTable(
  "role_permissions",
  {
    id: serial("id").primaryKey(),
    roleId: integer("role_id")
      .references(() => roles.id, { onDelete: "cascade" })
      .notNull(),
    permissionId: integer("permission_id")
      .references(() => permissions.id, { onDelete: "cascade" })
      .notNull(),
    grantedAt: timestamp("granted_at").defaultNow().notNull(),
  },
  (table) => [
    index("role_permissions_role_id_idx").on(table.roleId),
    index("role_permissions_permission_id_idx").on(
      table.permissionId),
  ]
);

// Company Settings
export const company_settings = pgTable("company_settings", {
	id: serial("id").primaryKey(),
	company_name: varchar("company_name", { length: 100 }).notNull(),
	address: text("address"),
	phone: varchar("phone", { length: 20 }),
	email: varchar("email", { length: 100 }),
	website: varchar("website", { length: 100 }),
	logo: varchar("logo", { length: 255 }),
	currency: varchar("currency", { length: 10 }).default("IDR"),
	timezone: varchar("timezone", { length: 50 }).default("Asia/Jakarta"),
	language: varchar("language", { length: 10 }).default("id"),
	created_at: timestamp("created_at").defaultNow(),
	updated_at: timestamp("updated_at").defaultNow(),
});

// ============ ROUTER MANAGEMENT ============
// Routers
export const routers = pgTable(
	"routers",
	{
		id: serial("id").primaryKey(),
		uuid: uuid("uuid").defaultRandom().notNull().unique(),
		name: varchar("name", { length: 100 }).notNull(),
		ip_address: varchar("ip_address", { length: 45 }).notNull(),
		username: varchar("username", { length: 50 }).notNull(),
		password: varchar("password", { length: 255 }).notNull(),
		keepalive: boolean("keepalive").default(true),
		timeout: integer("timeout").default(300000),
		port: integer("port").default(8728),
		api_port: integer("api_port").default(8729),
		location: varchar("location", { length: 100 }),
		description: text("description"),
		is_active: boolean("is_active").default(true),
		last_seen: timestamp("last_seen"),
		status: varchar("status", { length: 20 }).default("offline"), // online, offline, error
		version: varchar("version", { length: 50 }),
		uptime: varchar("uptime", { length: 50 }),
		created_at: timestamp("created_at").defaultNow(),
		updated_at: timestamp("updated_at").defaultNow(),
	},
	(table) => [
		index("routers_ip_idx").on(table.ip_address),
		index("routers_status_idx").on(table.status),
		index("routers_active_idx").on(table.is_active),
	]
);

// ============ SERVICE PLANS ============
// Service Plans
export const service_plans = pgTable(
	"service_plans",
	{
		id: serial("id").primaryKey(),
		uuid: uuid("uuid").defaultRandom().notNull().unique(),
		name: varchar("name", { length: 100 }).notNull(),
		type: varchar("type", { length: 20 }).notNull(), // pppoe, hotspot
		price: decimal("price", { precision: 15, scale: 2 }).notNull(),
		bandwidth: varchar("bandwidth", { length: 50 }), // e.g., "10M/5M"
		download_speed: integer("download_speed"), // in Kbps
		upload_speed: integer("upload_speed"), // in Kbps
		data_limit: integer("data_limit"), // in MB, null = unlimited
		time_limit: integer("time_limit"), // in minutes, null = unlimited
		validity: integer("validity").default(30), // in days
		description: text("description"),
		is_active: boolean("is_active").default(true),
		created_at: timestamp("created_at").defaultNow(),
		updated_at: timestamp("updated_at").defaultNow(),
	},
	(table) => [
		index("service_plans_type_idx").on(table.type),
		index("service_plans_active_idx").on(table.is_active),
		index("service_plans_price_idx").on(table.price),
  ]
);

// ============ CUSTOMERS ============
// Customers
export const customers = pgTable(
	"customers",
	{
		id: serial("id").primaryKey(),
		uuid: uuid("uuid").defaultRandom().notNull().unique(),
		username: varchar("username", { length: 50 }).notNull().unique(),
		email: varchar("email", { length: 100 }),
		password: varchar("password", { length: 255 }),
		first_name: varchar("first_name", { length: 50 }),
		last_name: varchar("last_name", { length: 50 }),
		phone: varchar("phone", { length: 20 }),
		address: text("address"),
		id_number: varchar("id_number", { length: 50 }),
		birth_date: timestamp("birth_date"),
		gender: varchar("gender", { length: 10 }),
		service_plan_id: integer("service_plan_id").references(
			() => service_plans.id
		),
		router_id: integer("router_id").references(() => routers.id),
		status: statusEnum("status").default("active"),
		balance: decimal("balance", { precision: 15, scale: 2 }).default("0"),
		registration_date: timestamp("registration_date").defaultNow(),
		last_login: timestamp("last_login"),
		notes: text("notes"),
		created_at: timestamp("created_at").defaultNow(),
		updated_at: timestamp("updated_at").defaultNow(),
	},
	(table) => [
		index("customers_username_idx").on(table.username),
		index("customers_email_idx").on(table.email),
		index("customers_phone_idx").on(table.phone),
		index("customers_status_idx").on(table.status),
		index("customers_service_plan_idx").on(
			table.service_plan_id
		),
		index("customers_router_idx").on(table.router_id),
	]
);

// ============ PPPOE TABLES (MULTI-ROUTER SUPPORT) ============
// PPPoE Profiles - Updated with router_id and snake_case
export const pppoe_profiles = pgTable(
	"pppoe_profiles",
	{
		id: serial("id").primaryKey(),
		// Mikrotik ID untuk sinkronisasi per router
		mikrotik_id: varchar("mikrotik_id", { length: 50 }),
		router_id: integer("router_id")
			.references(() => routers.id)
			.notNull(),
		name: varchar("name", { length: 100 }).notNull(),
		local_address: varchar("local_address", { length: 100 }),
		remote_address: varchar("remote_address", { length: 100 }),
		remote_ipv6_prefix_pool: varchar("remote_ipv6_prefix_pool", {
			length: 100,
		}),
		dhcpv6_pd_pool: varchar("dhcpv6_pd_pool", { length: 100 }),
		bridge: varchar("bridge", { length: 100 }),
		bridge_port_priority: integer("bridge_port_priority"),
		bridge_path_cost: integer("bridge_path_cost"),
		bridge_horizon: integer("bridge_horizon"),
		bridge_learning: boolean("bridge_learning"),
		bridge_port_vid: integer("bridge_port_vid"),
		bridge_port_trusted: boolean("bridge_port_trusted"),
		incoming_filter: varchar("incoming_filter", { length: 100 }),
		outgoing_filter: varchar("outgoing_filter", { length: 100 }),
		address_list: varchar("address_list", { length: 100 }),
		interface_list: varchar("interface_list", { length: 100 }),
		dns_server: varchar("dns_server", { length: 100 }),
		wins_server: varchar("wins_server", { length: 100 }),
		change_tcp_mss: boolean("change_tcp_mss"),
		use_upnp: boolean("use_upnp"),
		comment: text("comment"),
		use_ipv6: boolean("use_ipv6"),
		use_mpls: boolean("use_mpls"),
		use_compression: boolean("use_compression"),
		use_encryption: boolean("use_encryption"),
		session_timeout: varchar("session_timeout", { length: 50 }),
		idle_timeout: varchar("idle_timeout", { length: 50 }),
		rate_limit: varchar("rate_limit", { length: 100 }),
		only_one: boolean("only_one"),
		insert_queue_before: varchar("insert_queue_before", { length: 100 }),
		parent_queue: varchar("parent_queue", { length: 100 }),
		queue_type_rx: varchar("queue_type_rx", { length: 100 }),
		queue_type_tx: varchar("queue_type_tx", { length: 100 }),
		on_up_script: text("on_up_script"),
		on_down_script: text("on_down_script"),
		// Link to service plan
		service_plan_id: integer("service_plan_id").references(
			() => service_plans.id
		),
		is_active: boolean("is_active").default(true),
		synced_to_mikrotik: boolean("synced_to_mikrotik").default(false),
		created_at: timestamp("created_at").defaultNow(),
		updated_at: timestamp("updated_at").defaultNow(),
	},
	(table) => [
		index("pppoe_profiles_name_router_idx").on(
			table.name,
			table.router_id
		),
		index("pppoe_profiles_mikrotik_idx").on(table.mikrotik_id),
		index("pppoe_profiles_router_idx").on(table.router_id),
		index("pppoe_profiles_service_plan_idx").on(
			table.service_plan_id
		),
		index("pppoe_profiles_active_idx").on(table.is_active),
	]
);

export const pppoe_secrets = pgTable(
	"pppoe_secrets",
	{
		id: serial("id").primaryKey(),
		// Mikrotik ID untuk sinkronisasi per router
		mikrotik_id: varchar("mikrotik_id", { length: 50 }),
		router_id: integer("router_id")
			.references(() => routers.id)
			.notNull(),
		enabled: boolean("enabled").default(true),
		name: varchar("name", { length: 100 }).notNull(),
		password: varchar("password", { length: 100 }),
		service: varchar("service", { length: 50 }), // e.g., pppoe, l2tp, pptp
		caller_id: varchar("caller_id", { length: 100 }),
		profile: varchar("profile", { length: 100 }),
		local_address: varchar("local_address", { length: 100 }),
		remote_address: varchar("remote_address", { length: 100 }),
		remote_ipv6_prefix: varchar("remote_ipv6_prefix", { length: 100 }),
		routes: text("routes"),
		ipv6_routes: text("ipv6_routes"),
		limit_bytes_in: bigint("limit_bytes_in", { mode: "bigint" }),
		limit_bytes_out: bigint("limit_bytes_out", { mode: "bigint" }),
		last_logged_out: timestamp("last_logged_out"),
		last_caller_id: varchar("last_caller_id", { length: 100 }),
		last_disconnect_reason: varchar("last_disconnect_reason", { length: 255 }),
		comment: text("comment"),
		// Link to customer and profile
		customer_id: integer("customer_id").references(() => customers.id),
		profile_id: integer("profile_id").references(() => pppoe_profiles.id),
		expiry_date: timestamp("expiry_date"),
		status: statusEnum("status").default("active"),
		synced_to_mikrotik: boolean("synced_to_mikrotik").default(false),
		created_at: timestamp("created_at").defaultNow(),
		updated_at: timestamp("updated_at").defaultNow(),
	},
	(table) => [
		index("pppoe_secrets_name_router_idx").on(
			table.name,
			table.router_id
		),
		index("pppoe_secrets_mikrotik_idx").on(table.mikrotik_id),
		index("pppoe_secrets_customer_idx").on(table.customer_id),
		index("pppoe_secrets_router_idx").on(table.router_id),
		index("pppoe_secrets_profile_idx").on(table.profile_id),
		index("pppoe_secrets_status_idx").on(table.status),
		index("pppoe_secrets_expiry_idx").on(table.expiry_date),
	]
);

// ============ HOTSPOT TABLES (MULTI-ROUTER SUPPORT) ============
// Hotspot Server Profiles
export const hotspot_server_profiles = pgTable(
	"hotspot_server_profiles",
	{
		id: serial("id").primaryKey(),
		router_id: integer("router_id")
			.references(() => routers.id)
			.notNull(),
		mikrotik_id: varchar("mikrotik_id", { length: 50 }),
		name: varchar("name", { length: 64 }).notNull(),
		dns_name: varchar("dns_name", { length: 64 }),
		html_directory: varchar("html_directory", { length: 128 }),
		http_proxy: varchar("http_proxy", { length: 64 }),
		https_certificate: varchar("https_certificate", { length: 64 }),
		login_by: varchar("login_by", { length: 32 }),
		split_user_domain: boolean("split_user_domain"),
		use_radius: boolean("use_radius"),
		radius_accounting: boolean("radius_accounting"),
		radius_interim_update: varchar("radius_interim_update", { length: 32 }),
		radius_location_id: varchar("radius_location_id", { length: 64 }),
		radius_location_name: varchar("radius_location_name", { length: 64 }),
		radius_called_id: varchar("radius_called_id", { length: 64 }),
		smtp_server: varchar("smtp_server", { length: 64 }),
		is_active: boolean("is_active").default(true),
		synced_to_mikrotik: boolean("synced_to_mikrotik").default(false),
		created_at: timestamp("created_at").defaultNow(),
		updated_at: timestamp("updated_at").defaultNow(),
	},
	(table) => [
		index("hotspot_server_profiles_name_router_idx").on(
			table.name,
			table.router_id
		),
		index("hotspot_server_profiles_mikrotik_idx").on(
			table.mikrotik_id
		),
		index("hotspot_server_profiles_router_idx").on(table.router_id),
	]
);

export const hotspot_servers = pgTable(
	"hotspot_servers",
	{
		id: serial("id").primaryKey(),
		// Mikrotik ID untuk sinkronisasi per router
		mikrotik_id: varchar("mikrotik_id", { length: 50 }),
		router_id: integer("router_id")
			.references(() => routers.id)
			.notNull(),
		// Switch "Enabled"
		enabled: boolean("enabled").default(true),
		// Nama instance server
		name: varchar("name", { length: 64 }).notNull(),
		// Interface fisik/vlan
		interface: varchar("interface", { length: 32 }).notNull(),
		// Pool IP untuk klien
		address_pool: varchar("address_pool", { length: 64 }),
		// Profil server
		server_profile_id: integer("server_profile_id").references(
			() => hotspot_server_profiles.id,
			{
				onDelete: "set null",
			}
		),
		// Timeouts
		idle_timeout: varchar("idle_timeout", { length: 32 }),
		keepalive_timeout: varchar("keepalive_timeout", { length: 32 }),
		login_timeout: varchar("login_timeout", { length: 32 }),
		// Addresses‑per‑MAC
		addresses_per_mac: varchar("addresses_per_mac", { length: 16 }),
		status: statusEnum("status").default("active"),
		synced_to_mikrotik: boolean("synced_to_mikrotik").default(false),
		created_at: timestamp("created_at").defaultNow(),
		updated_at: timestamp("updated_at").defaultNow(),
	},
	(table) => [
		index("hotspot_servers_name_router_idx").on(
			table.name,
			table.router_id
		),
		index("hotspot_servers_interface_idx").on(table.interface),
		index("hotspot_servers_enabled_idx").on(table.enabled),
		index("hotspot_servers_mikrotik_idx").on(table.mikrotik_id),
		index("hotspot_servers_router_idx").on(table.router_id),
	]
);

export const hotspot_profiles = pgTable(
	"hotspot_profiles",
	{
		id: serial("id").primaryKey(),
		// Mikrotik ID untuk sinkronisasi per router
		mikrotik_id: varchar("mikrotik_id", { length: 50 }),
		router_id: integer("router_id")
			.references(() => routers.id)
			.notNull(),
		// ----- General -----
		name: varchar("name", { length: 64 }).notNull(),
		address_pool: varchar("address_pool", { length: 64 }),
		// ----- Timeouts -----
		session_timeout: varchar("session_timeout", { length: 32 }),
		idle_timeout: varchar("idle_timeout", { length: 32 }),
		keepalive_timeout: varchar("keepalive_timeout", { length: 32 }),
		status_autorefresh: varchar("status_autorefresh", { length: 32 }),
		// ----- Shared / Rate -----
		shared_users: integer("shared_users"),
		rate_limit: varchar("rate_limit", { length: 64 }),
		// ----- MAC Cookie -----
		add_mac_cookie: boolean("add_mac_cookie"),
		mac_cookie_timeout: varchar("mac_cookie_timeout", { length: 32 }),
		// ----- Firewall / Marks -----
		address_list: varchar("address_list", { length: 64 }),
		incoming_filter: varchar("incoming_filter", { length: 64 }),
		outgoing_filter: varchar("outgoing_filter", { length: 64 }),
		incoming_packet_mark: varchar("incoming_packet_mark", { length: 64 }),
		outgoing_packet_mark: varchar("outgoing_packet_mark", { length: 64 }),
		// ----- Misc behaviour -----
		open_status_page: varchar("open_status_page", { length: 32 }), // "HTTP login"/"always"
		transparent_proxy: boolean("transparent_proxy"),
		// ----- Queue -----
		insert_queue_before: varchar("insert_queue_before", { length: 64 }),
		parent_queue: varchar("parent_queue", { length: 64 }),
		queue_type: varchar("queue_type", { length: 64 }),
		// ----- Advertise -----
		advertise: boolean("advertise"),
		advertise_urls: text("advertise_urls"),
		advertise_intervals: text("advertise_intervals"),
		advertise_timeout: varchar("advertise_timeout", { length: 32 }),
		// ----- Scripts -----
		on_login_script: text("on_login_script"),
		on_logout_script: text("on_logout_script"),
		// Link to service plan
		service_plan_id: integer("service_plan_id").references(
			() => service_plans.id
		),
		status: statusEnum("status").default("active"),
		synced_to_mikrotik: boolean("synced_to_mikrotik").default(false),
		created_at: timestamp("created_at").defaultNow(),
		updated_at: timestamp("updated_at").defaultNow(),
	},
	(table) => [
		index("hotspot_profiles_name_router_idx").on(
			table.name,
			table.router_id
		),
		index("hotspot_profiles_advertise_idx").on(table.advertise),
		index("hotspot_profiles_mikrotik_idx").on(table.mikrotik_id),
		index("hotspot_profiles_router_idx").on(table.router_id),
		index("hotspot_profiles_service_plan_idx").on(
			table.service_plan_id
		),
	]
);

export const hotspot_users = pgTable(
	"hotspot_users",
	{
		id: serial("id").primaryKey(),
		// Mikrotik ID untuk sinkronisasi per router
		mikrotik_id: varchar("mikrotik_id", { length: 50 }),
		router_id: integer("router_id")
			.references(() => routers.id)
			.notNull(),
		// Basic Info
		name: varchar("name", { length: 64 }).notNull(),
		password: varchar("password", { length: 64 }),
		comment: text("comment"),
		enabled: boolean("enabled").default(true),
		// Server/Profile
		server_id: integer("server_id")
			.references(() => hotspot_servers.id)
			.notNull(),
		profile_id: integer("profile_id").references(() => hotspot_profiles.id),
		// Link to customer
		customer_id: integer("customer_id").references(() => customers.id),
		// Network Config
		address: varchar("address", { length: 64 }),
		mac_address: varchar("mac_address", { length: 17 }),
		address_pool: varchar("address_pool", { length: 64 }),
		// Timeout Config
		session_timeout: varchar("session_timeout", { length: 32 }),
		idle_timeout: varchar("idle_timeout", { length: 32 }),
		keepalive_timeout: varchar("keepalive_timeout", { length: 32 }),
		status_autorefresh: varchar("status_autorefresh", { length: 32 }),
		// Shared / Bandwidth
		shared_users: integer("shared_users"),
		rate_limit: varchar("rate_limit", { length: 64 }),
		// MAC Cookie
		add_mac_cookie: boolean("add_mac_cookie"),
		mac_cookie_timeout: varchar("mac_cookie_timeout", { length: 32 }),
		// Address List & Filter
		address_list: varchar("address_list", { length: 64 }),
		incoming_filter: varchar("incoming_filter", { length: 64 }),
		outgoing_filter: varchar("outgoing_filter", { length: 64 }),
		incoming_packet_mark: varchar("incoming_packet_mark", { length: 64 }),
		outgoing_packet_mark: varchar("outgoing_packet_mark", { length: 64 }),
		// Status Page & Proxy
		open_status_page: varchar("open_status_page", { length: 32 }), // e.g. "always"
		transparent_proxy: boolean("transparent_proxy"),
		// Queue Settings
		insert_queue_before: varchar("insert_queue_before", { length: 64 }),
		parent_queue: varchar("parent_queue", { length: 64 }),
		queue_type: varchar("queue_type", { length: 64 }),
		// Advertise Settings
		advertise: boolean("advertise"),
		advertise_urls: text("advertise_urls"), // bisa disimpan comma-separated
		advertise_intervals: text("advertise_intervals"),
		advertise_timeout: varchar("advertise_timeout", { length: 32 }),
		// Scripts
		on_login_script: text("on_login_script"),
		on_logout_script: text("on_logout_script"),
		// Limits
		limit_uptime: varchar("limit_uptime", { length: 32 }),
		limit_bytes_in: bigint("limit_bytes_in", { mode: "bigint" }),
		limit_bytes_out: bigint("limit_bytes_out", { mode: "bigint" }),
		limit_bytes_total: bigint("limit_bytes_total", { mode: "bigint" }),
		// Optional
		routes: text("routes"),
		email: varchar("email", { length: 128 }),
		// Legacy fields for compatibility
		expiry_date: timestamp("expiry_date"),
		last_login: timestamp("last_login"),
		bytes_in: integer("bytes_in").default(0),
		bytes_out: integer("bytes_out").default(0),
		status: statusEnum("status").default("active"),
		synced_to_mikrotik: boolean("synced_to_mikrotik").default(false),
		// Timestamp
		created_at: timestamp("created_at").defaultNow(),
		updated_at: timestamp("updated_at").defaultNow(),
	},
	(table) => [
		index("hotspot_users_name_router_idx").on(
			table.name,
			table.router_id
		),
		index("hotspot_users_server_idx").on(table.server_id),
		index("hotspot_users_profile_idx").on(table.profile_id),
		index("hotspot_users_enabled_idx").on(table.enabled),
		index("hotspot_users_customer_idx").on(table.customer_id),
		index("hotspot_users_status_idx").on(table.status),
		index("hotspot_users_expiry_idx").on(table.expiry_date),
		index("hotspot_users_mikrotik_idx").on(table.mikrotik_id),
		index("hotspot_users_router_idx").on(table.router_id),
	]
);

// Hotspot Groups for organizing users
export const hotspot_groups = pgTable(
	"hotspot_groups",
	{
		id: serial("id").primaryKey(),
		router_id: integer("router_id")
			.references(() => routers.id)
			.notNull(),
		name: varchar("name", { length: 100 }).notNull(),
		description: text("description"),
		is_active: boolean("is_active").default(true),
		created_at: timestamp("created_at").defaultNow(),
		updated_at: timestamp("updated_at").defaultNow(),
	},
	(table) => [
		index("hotspot_groups_name_router_idx").on(
			table.name,
			table.router_id
		),
		index("hotspot_groups_router_idx").on(table.router_id),
		index("hotspot_groups_active_idx").on(table.is_active),
	]
);

// Hotspot batch voucher generation
export const hotspot_batch = pgTable(
	"hotspot_batch",
	{
		id: serial("id").primaryKey(),
		router_id: integer("router_id")
			.references(() => routers.id)
			.notNull(),
		batch_name: varchar("batch_name", { length: 100 }).notNull(),
		profile_id: integer("profile_id").references(() => hotspot_profiles.id, {
			onDelete: "set null",
		}),
		group_id: integer("group_id").references(() => hotspot_groups.id, {
			onDelete: "set null",
		}),
		server_id: integer("server_id").references(() => hotspot_servers.id, {
			onDelete: "set null",
		}),
		total_generated: integer("total_generated").default(0),
		length: integer("length").default(6),
		prefix: varchar("prefix", { length: 20 }),
		characters: varchar("characters", { length: 100 }).default(
			"ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
		),
		password_mode: varchar("password_mode", { length: 20 }).default(
			"same_as_username"
		),
		comment: text("comment"),
		shared_users: integer("shared_users").default(1),
		disable: boolean("disable").default(false),
		created_by: integer("created_by").references(() => users.id),
		created_at: timestamp("created_at").defaultNow(),
		updated_at: timestamp("updated_at").defaultNow(),
	},
	(table) => [
		index("hotspot_batch_name_router_idx").on(
			table.batch_name,
			table.router_id
		),
		index("hotspot_batch_profile_idx").on(table.profile_id),
		index("hotspot_batch_created_by_idx").on(table.created_by),
		index("hotspot_batch_router_idx").on(table.router_id),
	]
);

// Junction table for user-batch relationship
export const hotspot_user_batch = pgTable(
	"hotspot_user_batch",
	{
		user_id: integer("user_id")
			.notNull()
			.references(() => hotspot_users.id, {
				onDelete: "cascade",
			}),
		batch_id: integer("batch_id")
			.notNull()
			.references(() => hotspot_batch.id, {
				onDelete: "cascade",
			}),
	},
	(table) => [
		primaryKey({ columns: [table.user_id, table.batch_id] }),
	]
);

export const vouchers = pgTable(
	"vouchers",
	{
		id: serial("id").primaryKey(),
		// Mikrotik ID untuk sinkronisasi per router
		mikrotik_id: varchar("mikrotik_id", { length: 50 }),
		router_id: integer("router_id")
			.references(() => routers.id)
			.notNull(),
		code: varchar("code", { length: 50 }).notNull(),
		profile_id: integer("profile_id").references(() => hotspot_profiles.id),
		server_id: integer("server_id").references(() => hotspot_servers.id),
		batch_id: integer("batch_id").references(() => hotspot_batch.id),
		validity_period: integer("validity_period"), // in hours
		price: decimal("price", { precision: 10, scale: 2 }),
		created_by: integer("created_by").references(() => users.id),
		used_by: varchar("used_by", { length: 100 }),
		used_at: timestamp("used_at"),
		expiry_date: timestamp("expiry_date"),
		status: voucherStatusEnum("status").default("unused"),
		synced_to_mikrotik: boolean("synced_to_mikrotik").default(false),
		created_at: timestamp("created_at").defaultNow(),
		updated_at: timestamp("updated_at").defaultNow(),
	},
	(table) => [
		index("vouchers_code_router_idx").on(
			table.code,
			table.router_id
		),
		index("vouchers_status_idx").on(table.status),
		index("vouchers_created_by_idx").on(table.created_by),
		index("vouchers_batch_idx").on(table.batch_id),
		index("vouchers_mikrotik_idx").on(table.mikrotik_id),
		index("vouchers_router_idx").on(table.router_id),
	]
);

// ============ BILLING & FINANCE ============
// Customer Service History
export const customer_service_history = pgTable(
	"customer_service_history",
	{
		id: serial("id").primaryKey(),
		customer_id: integer("customer_id").references(() => customers.id),
		service_plan_id: integer("service_plan_id").references(
			() => service_plans.id
		),
		start_date: timestamp("start_date").notNull(),
		end_date: timestamp("end_date"),
		price: decimal("price", { precision: 15, scale: 2 }).notNull(),
		status: varchar("status", { length: 20 }).default("active"),
		notes: text("notes"),
		created_at: timestamp("created_at").defaultNow(),
	},
	(table) => [
		index("customer_service_history_customer_idx").on(
			table.customer_id
		),
		index("customer_service_history_service_plan_idx").on(
			table.service_plan_id
		),
		index("customer_service_history_date_idx").on(table.start_date),
	]
);

// Invoices
export const invoices = pgTable(
	"invoices",
	{
		id: serial("id").primaryKey(),
		uuid: uuid("uuid").defaultRandom().notNull().unique(),
		invoice_number: varchar("invoice_number", { length: 50 })
			.notNull()
			.unique(),
		customer_id: integer("customer_id").references(() => customers.id),
		service_plan_id: integer("service_plan_id").references(
			() => service_plans.id
		),
		amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
		tax: decimal("tax", { precision: 15, scale: 2 }).default("0"),
		discount: decimal("discount", { precision: 15, scale: 2 }).default("0"),
		total_amount: decimal("total_amount", {
			precision: 15,
			scale: 2,
		}).notNull(),
		due_date: timestamp("due_date").notNull(),
		status: varchar("status", { length: 20 }).default("pending"), // pending, paid, overdue, cancelled
		paid_at: timestamp("paid_at"),
		payment_method: varchar("payment_method", { length: 50 }),
		description: text("description"),
		notes: text("notes"),
		created_at: timestamp("created_at").defaultNow(),
		updated_at: timestamp("updated_at").defaultNow(),
	},
	(table) => [
		index("invoices_customer_idx").on(table.customer_id),
		index("invoices_status_idx").on(table.status),
		index("invoices_due_date_idx").on(table.due_date),
		index("invoices_number_idx").on(table.invoice_number),
	]
);

// Payments
export const payments = pgTable(
	"payments",
	{
		id: serial("id").primaryKey(),
		uuid: uuid("uuid").defaultRandom().notNull().unique(),
		invoice_id: integer("invoice_id").references(() => invoices.id),
		customer_id: integer("customer_id").references(() => customers.id),
		amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
		method: varchar("method", { length: 50 }).notNull(), // cash, bank_transfer, ewallet, etc
		reference: varchar("reference", { length: 100 }),
		status: varchar("status", { length: 20 }).default("pending"), // pending, completed, failed
		processed_by: integer("processed_by").references(() => users.id),
		processed_at: timestamp("processed_at"),
		notes: text("notes"),
		created_at: timestamp("created_at").defaultNow(),
	},
	(table) => [
		index("payments_invoice_idx").on(table.invoice_id),
		index("payments_customer_idx").on(table.customer_id),
		index("payments_status_idx").on(table.status),
		index("payments_method_idx").on(table.method),
		index("payments_date_idx").on(table.created_at),
	]
);

// Financial Transactions
export const financial_transactions = pgTable(
	"financial_transactions",
	{
		id: serial("id").primaryKey(),
		uuid: uuid("uuid").defaultRandom().notNull().unique(),
		type: varchar("type", { length: 20 }).notNull(), // income, expense
		category: varchar("category", { length: 50 }).notNull(),
		amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
		description: text("description").notNull(),
		reference: varchar("reference", { length: 100 }),
		date: timestamp("date").notNull(),
		created_by: integer("created_by").references(() => users.id),
		created_at: timestamp("created_at").defaultNow(),
	},
	(table) => [
		index("financial_transactions_type_idx").on(table.type),
		index("financial_transactions_category_idx").on(
			table.category
		),
		index("financial_transactions_date_idx").on(table.date),
		index("financial_transactions_amount_idx").on(table.amount),
	]
);

// Bandwidth Usage
export const bandwidth_usage = pgTable(
	"bandwidth_usage",
	{
		id: serial("id").primaryKey(),
		router_id: integer("router_id")
			.references(() => routers.id)
			.notNull(),
		customer_id: integer("customer_id").references(() => customers.id),
		username: varchar("username", { length: 50 }).notNull(),
		session_type: varchar("session_type", { length: 20 }).notNull(), // pppoe, hotspot
		bytes_in: varchar("bytes_in", { length: 50 }),
		bytes_out: varchar("bytes_out", { length: 50 }),
		packets_in: varchar("packets_in", { length: 50 }),
		packets_out: varchar("packets_out", { length: 50 }),
		recorded_at: timestamp("recorded_at").defaultNow(),
	},
	(table) => [
		index("bandwidth_usage_router_idx").on(table.router_id),
		index("bandwidth_usage_customer_idx").on(table.customer_id),
		index("bandwidth_usage_username_idx").on(table.username),
		index("bandwidth_usage_type_idx").on(table.session_type),
		index("bandwidth_usage_recorded_at_idx").on(
			table.recorded_at
		),
	]
);

// ============ NOTIFICATION SETTINGS ============
// Notification Settings
export const notification_settings = pgTable("notification_settings", {
	id: serial("id").primaryKey(),
	whatsapp_api_url: varchar("whatsapp_api_url", { length: 255 }),
	whatsapp_api_key: varchar("whatsapp_api_key", { length: 255 }),
	whatsapp_from_number: varchar("whatsapp_from_number", { length: 20 }),
	telegram_bot_token: varchar("telegram_bot_token", { length: 255 }),
	telegram_chat_id: varchar("telegram_chat_id", { length: 100 }),
	email_smtp_host: varchar("email_smtp_host", { length: 100 }),
	email_smtp_port: integer("email_smtp_port").default(587),
	email_smtp_user: varchar("email_smtp_user", { length: 100 }),
	email_smtp_password: varchar("email_smtp_password", { length: 255 }),
	email_from_address: varchar("email_from_address", { length: 100 }),
	email_from_name: varchar("email_from_name", { length: 100 }),
	is_whatsapp_enabled: boolean("is_whatsapp_enabled").default(false),
	is_telegram_enabled: boolean("is_telegram_enabled").default(false),
	is_email_enabled: boolean("is_email_enabled").default(false),
	created_at: timestamp("created_at").defaultNow(),
	updated_at: timestamp("updated_at").defaultNow(),
});

// Notification Templates
export const notification_templates = pgTable(
	"notification_templates",
	{
		id: serial("id").primaryKey(),
		name: varchar("name", { length: 100 }).notNull(),
		type: varchar("type", { length: 20 }).notNull(), // whatsapp, telegram, email
		event: varchar("event", { length: 50 }).notNull(), // payment_reminder, service_expiry, etc
		subject: varchar("subject", { length: 200 }),
		content: text("content").notNull(),
		variables: jsonb("variables"), // Available variables for template
		is_active: boolean("is_active").default(true),
		created_at: timestamp("created_at").defaultNow(),
		updated_at: timestamp("updated_at").defaultNow(),
	},
	(table) => [
		index("notification_templates_type_idx").on(table.type),
		index("notification_templates_event_idx").on(table.event),
		index("notification_templates_active_idx").on(table.is_active),
	]
);

// ============ TASK MANAGEMENT ============
// Tasks
export const tasks = pgTable(
	"tasks",
	{
		id: serial("id").primaryKey(),
		uuid: uuid("uuid").defaultRandom().notNull().unique(),
		title: varchar("title", { length: 200 }).notNull(),
		description: text("description"),
		type: varchar("type", { length: 50 }).notNull(), // maintenance, support, billing, etc
		priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high, urgent
		status: varchar("status", { length: 20 }).default("pending"), // pending, in_progress, completed, cancelled
		assigned_to: integer("assigned_to").references(() => users.id),
		customer_id: integer("customer_id").references(() => customers.id),
		router_id: integer("router_id").references(() => routers.id),
		due_date: timestamp("due_date"),
		completed_at: timestamp("completed_at"),
		created_by: integer("created_by").references(() => users.id),
		created_at: timestamp("created_at").defaultNow(),
		updated_at: timestamp("updated_at").defaultNow(),
	},
	(table) => [
		index("tasks_assigned_idx").on(table.assigned_to),
		index("tasks_status_idx").on(table.status),
		index("tasks_priority_idx").on(table.priority),
		index("tasks_type_idx").on(table.type),
		index("tasks_due_date_idx").on(table.due_date),
		index("tasks_customer_idx").on(table.customer_id),
	]
);

// Task Comments
export const task_comments = pgTable(
	"task_comments",
	{
		id: serial("id").primaryKey(),
		task_id: integer("task_id").references(() => tasks.id),
		user_id: integer("user_id").references(() => users.id),
		comment: text("comment").notNull(),
		created_at: timestamp("created_at").defaultNow(),
	},
	(table) => [
		index("task_comments_task_idx").on(table.task_id),
		index("task_comments_user_idx").on(table.user_id),
		index("task_comments_date_idx").on(table.created_at),
	]
);

// ============ SCHEDULING ============
// Schedules
export const schedules = pgTable(
	"schedules",
	{
		id: serial("id").primaryKey(),
		uuid: uuid("uuid").defaultRandom().notNull().unique(),
		name: varchar("name", { length: 100 }).notNull(),
		type: varchar("type", { length: 50 }).notNull(), // backup, maintenance, monitoring, billing
		description: text("description"),
		cron_expression: varchar("cron_expression", { length: 100 }).notNull(),
		command: text("command"),
		parameters: jsonb("parameters"),
		is_active: boolean("is_active").default(true),
		last_run: timestamp("last_run"),
		next_run: timestamp("next_run"),
		run_count: integer("run_count").default(0),
		created_by: integer("created_by").references(() => users.id),
		created_at: timestamp("created_at").defaultNow(),
		updated_at: timestamp("updated_at").defaultNow(),
	},
	(table) => [
		index("schedules_type_idx").on(table.type),
		index("schedules_active_idx").on(table.is_active),
		index("schedules_next_run_idx").on(table.next_run),
	]
);

// ============ NOTES & DOCUMENTATION ============
// Notes
export const notes = pgTable(
	"notes",
	{
		id: serial("id").primaryKey(),
		uuid: uuid("uuid").defaultRandom().notNull().unique(),
		title: varchar("title", { length: 200 }).notNull(),
		content: text("content").notNull(),
		type: varchar("type", { length: 50 }).default("general"), // general, customer, technical, etc
		tags: varchar("tags", { length: 255 }),
		customer_id: integer("customer_id").references(() => customers.id),
		router_id: integer("router_id").references(() => routers.id),
		is_private: boolean("is_private").default(false),
		created_by: integer("created_by").references(() => users.id),
		created_at: timestamp("created_at").defaultNow(),
		updated_at: timestamp("updated_at").defaultNow(),
	},
	(table) => [
		index("notes_type_idx").on(table.type),
		index("notes_customer_idx").on(table.customer_id),
		index("notes_router_idx").on(table.router_id),
		index("notes_created_by_idx").on(table.created_by),
		index("notes_date_idx").on(table.created_at),
	]
);

// ============ SYSTEM LOGS ============
// System Logs
export const system_logs = pgTable(
	"system_logs",
	{
		id: serial("id").primaryKey(),
		level: varchar("level", { length: 20 }).notNull(), // info, warning, error, debug
		message: text("message").notNull(),
		context: jsonb("context"),
		user_id: integer("user_id").references(() => users.id),
		ip_address: varchar("ip_address", { length: 45 }),
		user_agent: varchar("user_agent", { length: 255 }),
		created_at: timestamp("created_at").defaultNow(),
	},
	(table) => [
		index("system_logs_level_idx").on(table.level),
		index("system_logs_user_idx").on(table.user_id),
		index("system_logs_date_idx").on(table.created_at),
	]
);

// Payment Methods
export const payment_methods = pgTable(
	"payment_methods",
	{
		id: serial("id").primaryKey(),
		name: varchar("name", { length: 50 }).notNull(),
		type: varchar("type", { length: 20 }).notNull(), // cash, bank, ewallet, crypto
		account_number: varchar("account_number", { length: 100 }),
		account_name: varchar("account_name", { length: 100 }),
		description: text("description"),
		is_active: boolean("is_active").default(true),
		created_at: timestamp("created_at").defaultNow(),
	},
	(table) => [
		index("payment_methods_type_idx").on(table.type),
		index("payment_methods_active_idx").on(table.is_active),
	]
);

// Data Usage History (for reporting)
export const data_usage_history = pgTable(
	"data_usage_history",
	{
		id: serial("id").primaryKey(),
		customer_id: integer("customer_id").references(() => customers.id),
		router_id: integer("router_id")
			.references(() => routers.id)
			.notNull(),
		session_type: varchar("session_type", { length: 20 }).notNull(),
		total_bytes_in: varchar("total_bytes_in", { length: 50 }),
		total_bytes_out: varchar("total_bytes_out", { length: 50 }),
		total_packets_in: varchar("total_packets_in", { length: 50 }),
		total_packets_out: varchar("total_packets_out", { length: 50 }),
		session_count: integer("session_count").default(0),
		total_uptime: integer("total_uptime").default(0), // in seconds
		record_date: timestamp("record_date").notNull(),
		created_at: timestamp("created_at").defaultNow(),
	},
	(table) => [
		index("data_usage_history_customer_idx").on(
			table.customer_id
		),
		index("data_usage_history_router_idx").on(table.router_id),
		index("data_usage_history_date_idx").on(table.record_date),
		index("data_usage_history_type_idx").on(table.session_type),
	]
);

// API Keys for external integrations
export const api_keys = pgTable(
	"api_keys",
	{
		id: serial("id").primaryKey(),
		name: varchar("name", { length: 100 }).notNull(),
		key: varchar("key", { length: 255 }).notNull().unique(),
		permissions: jsonb("permissions"), // JSON array of permissions
		is_active: boolean("is_active").default(true),
		last_used: timestamp("last_used"),
		expires_at: timestamp("expires_at"),
		created_by: integer("created_by").references(() => users.id),
		created_at: timestamp("created_at").defaultNow(),
	},
	(table) => [
		index("api_keys_key_idx").on(table.key),
		index("api_keys_active_idx").on(table.is_active),
		index("api_keys_expires_idx").on(table.expires_at),
	]
);

// ============ RELATIONS ============

// User Relations
export const usersRelations = relations(users, ({ many }) => ({
	userRoles: many(userRoles),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
	userRoles: many(userRoles),
	rolePermissions: many(rolePermissions),
}));


export const actionsRelations = relations(actions, ({ many }) => ({
	permissions: many(permissions),
}));

export const permissionsRelations = relations(
	permissions,
	({ many, one }) => ({
		rolePermissions: many(rolePermissions),
		resource: one(resources, {
			fields: [permissions.resourceId],
			references: [resources.id],
		}),
		action: one(actions, {
			fields: [permissions.actionId],
			references: [actions.id],
		}),
	})
);

export const userRolesRelations = relations(userRoles, ({ one }) => ({
	user: one(users, {
		fields: [userRoles.userId],
		references: [users.id],
	}),
	role: one(roles, {
		fields: [userRoles.roleId],
		references: [roles.id],
	}),
}));

export const resourcesRelations = relations(resources, ({ many }) => ({
	permissions: many(permissions),
}));

export const rolePermissionsRelations = relations(
	rolePermissions,
	({ one }) => ({
		role: one(roles, {
			fields: [rolePermissions.roleId],
			references: [roles.id],
		}),
		permission: one(permissions, {
			fields: [rolePermissions.permissionId],
			references: [permissions.id],
		}),
	})
);

export const routersRelations = relations(routers, ({ many }) => ({
	customers: many(customers),
	pppoe_profiles: many(pppoe_profiles),
	pppoe_secrets: many(pppoe_secrets),
	hotspot_server_profiles: many(hotspot_server_profiles),
	hotspot_servers: many(hotspot_servers),
	hotspot_profiles: many(hotspot_profiles),
	hotspot_users: many(hotspot_users),
	hotspot_groups: many(hotspot_groups),
	hotspot_batches: many(hotspot_batch),
	vouchers: many(vouchers),
	bandwidth_usage: many(bandwidth_usage),
	data_usage_history: many(data_usage_history),
	tasks: many(tasks),
	notes: many(notes),
}));

export const service_plansRelations = relations(service_plans, ({ many }) => ({
	customers: many(customers),
	customer_service_history: many(customer_service_history),
	invoices: many(invoices),
	pppoe_profiles: many(pppoe_profiles),
	hotspot_profiles: many(hotspot_profiles),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
	service_plan: one(service_plans, {
		fields: [customers.service_plan_id],
		references: [service_plans.id],
	}),
	router: one(routers, {
		fields: [customers.router_id],
		references: [routers.id],
	}),
	pppoe_secrets: many(pppoe_secrets),
	hotspot_users: many(hotspot_users),
	invoices: many(invoices),
	payments: many(payments),
	bandwidth_usage: many(bandwidth_usage),
	data_usage_history: many(data_usage_history),
	tasks: many(tasks),
	notes: many(notes),
	service_history: many(customer_service_history),
}));

export const pppoe_profilesRelations = relations(
	pppoe_profiles,
	({ one, many }) => ({
		router: one(routers, {
			fields: [pppoe_profiles.router_id],
			references: [routers.id],
		}),
		service_plan: one(service_plans, {
			fields: [pppoe_profiles.service_plan_id],
			references: [service_plans.id],
		}),
		secrets: many(pppoe_secrets),
  })
);

export const pppoe_secretsRelations = relations(pppoe_secrets, ({ one }) => ({
	router: one(routers, {
		fields: [pppoe_secrets.router_id],
		references: [routers.id],
	}),
	customer: one(customers, {
		fields: [pppoe_secrets.customer_id],
		references: [customers.id],
	}),
	profile: one(pppoe_profiles, {
		fields: [pppoe_secrets.profile_id],
		references: [pppoe_profiles.id],
	}),
}));

export const hotspot_server_profilesRelations = relations(
	hotspot_server_profiles,
	({ one, many }) => ({
		router: one(routers, {
			fields: [hotspot_server_profiles.router_id],
			references: [routers.id],
		}),
		servers: many(hotspot_servers),
  })
);

export const hotspot_serversRelations = relations(
	hotspot_servers,
	({ one, many }) => ({
		router: one(routers, {
			fields: [hotspot_servers.router_id],
			references: [routers.id],
		}),
		server_profile: one(hotspot_server_profiles, {
			fields: [hotspot_servers.server_profile_id],
			references: [hotspot_server_profiles.id],
		}),
		users: many(hotspot_users),
		vouchers: many(vouchers),
		batches: many(hotspot_batch),
  })
);

export const hotspot_profilesRelations = relations(
	hotspot_profiles,
	({ one, many }) => ({
		router: one(routers, {
			fields: [hotspot_profiles.router_id],
			references: [routers.id],
		}),
		service_plan: one(service_plans, {
			fields: [hotspot_profiles.service_plan_id],
			references: [service_plans.id],
		}),
		users: many(hotspot_users),
		vouchers: many(vouchers),
		batches: many(hotspot_batch),
  })
);

export const hotspot_usersRelations = relations(
	hotspot_users,
	({ one, many }) => ({
		router: one(routers, {
			fields: [hotspot_users.router_id],
			references: [routers.id],
		}),
		customer: one(customers, {
			fields: [hotspot_users.customer_id],
			references: [customers.id],
		}),
		profile: one(hotspot_profiles, {
			fields: [hotspot_users.profile_id],
			references: [hotspot_profiles.id],
		}),
		server: one(hotspot_servers, {
			fields: [hotspot_users.server_id],
			references: [hotspot_servers.id],
		}),
		batches: many(hotspot_user_batch),
  })
);

export const hotspot_groupsRelations = relations(
	hotspot_groups,
	({ one, many }) => ({
		router: one(routers, {
			fields: [hotspot_groups.router_id],
			references: [routers.id],
		}),
		batches: many(hotspot_batch),
  })
);

export const hotspot_batchRelations = relations(
	hotspot_batch,
	({ one, many }) => ({
		router: one(routers, {
			fields: [hotspot_batch.router_id],
			references: [routers.id],
		}),
		profile: one(hotspot_profiles, {
			fields: [hotspot_batch.profile_id],
			references: [hotspot_profiles.id],
		}),
		group: one(hotspot_groups, {
			fields: [hotspot_batch.group_id],
			references: [hotspot_groups.id],
		}),
		server: one(hotspot_servers, {
			fields: [hotspot_batch.server_id],
			references: [hotspot_servers.id],
		}),
		created_by_user: one(users, {
			fields: [hotspot_batch.created_by],
			references: [users.id],
		}),
		users: many(hotspot_user_batch),
		vouchers: many(vouchers),
  })
);

export const hotspot_user_batchRelations = relations(
	hotspot_user_batch,
	({ one }) => ({
		user: one(hotspot_users, {
			fields: [hotspot_user_batch.user_id],
			references: [hotspot_users.id],
		}),
		batch: one(hotspot_batch, {
			fields: [hotspot_user_batch.batch_id],
			references: [hotspot_batch.id],
		}),
  })
);

export const vouchersRelations = relations(vouchers, ({ one }) => ({
	router: one(routers, {
		fields: [vouchers.router_id],
		references: [routers.id],
	}),
	profile: one(hotspot_profiles, {
		fields: [vouchers.profile_id],
		references: [hotspot_profiles.id],
	}),
	server: one(hotspot_servers, {
		fields: [vouchers.server_id],
		references: [hotspot_servers.id],
	}),
	batch: one(hotspot_batch, {
		fields: [vouchers.batch_id],
		references: [hotspot_batch.id],
	}),
	created_by_user: one(users, {
		fields: [vouchers.created_by],
		references: [users.id],
	}),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
	customer: one(customers, {
		fields: [invoices.customer_id],
		references: [customers.id],
	}),
	service_plan: one(service_plans, {
		fields: [invoices.service_plan_id],
		references: [service_plans.id],
	}),
	payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
	invoice: one(invoices, {
		fields: [payments.invoice_id],
		references: [invoices.id],
	}),
	customer: one(customers, {
		fields: [payments.customer_id],
		references: [customers.id],
	}),
	processed_by_user: one(users, {
		fields: [payments.processed_by],
		references: [users.id],
	}),
}));

export const financial_transactionsRelations = relations(
	financial_transactions,
	({ one }) => ({
		created_by_user: one(users, {
			fields: [financial_transactions.created_by],
			references: [users.id],
		}),
  })
);

export const customer_service_historyRelations = relations(
	customer_service_history,
	({ one }) => ({
		customer: one(customers, {
			fields: [customer_service_history.customer_id],
			references: [customers.id],
		}),
		service_plan: one(service_plans, {
			fields: [customer_service_history.service_plan_id],
			references: [service_plans.id],
		}),
  })
);

export const bandwidth_usageRelations = relations(
	bandwidth_usage,
	({ one }) => ({
		router: one(routers, {
			fields: [bandwidth_usage.router_id],
			references: [routers.id],
		}),
		customer: one(customers, {
			fields: [bandwidth_usage.customer_id],
			references: [customers.id],
		}),
  })
);

export const tasksRelations = relations(tasks, ({ one, many }) => ({
	assigned_to_user: one(users, {
		fields: [tasks.assigned_to],
		references: [users.id],
	}),
	created_by_user: one(users, {
		fields: [tasks.created_by],
		references: [users.id],
	}),
	customer: one(customers, {
		fields: [tasks.customer_id],
		references: [customers.id],
	}),
	router: one(routers, {
		fields: [tasks.router_id],
		references: [routers.id],
	}),
	comments: many(task_comments),
}));

export const task_commentsRelations = relations(task_comments, ({ one }) => ({
	task: one(tasks, {
		fields: [task_comments.task_id],
		references: [tasks.id],
	}),
	user: one(users, {
		fields: [task_comments.user_id],
		references: [users.id],
	}),
}));

export const schedulesRelations = relations(schedules, ({ one }) => ({
	created_by_user: one(users, {
		fields: [schedules.created_by],
		references: [users.id],
	}),
}));

export const notesRelations = relations(notes, ({ one }) => ({
	created_by_user: one(users, {
		fields: [notes.created_by],
		references: [users.id],
	}),
	customer: one(customers, {
		fields: [notes.customer_id],
		references: [customers.id],
	}),
	router: one(routers, {
		fields: [notes.router_id],
		references: [routers.id],
	}),
}));

export const system_logsRelations = relations(system_logs, ({ one }) => ({
	user: one(users, {
		fields: [system_logs.user_id],
		references: [users.id],
	}),
}));

export const data_usage_historyRelations = relations(
	data_usage_history,
	({ one }) => ({
		customer: one(customers, {
			fields: [data_usage_history.customer_id],
			references: [customers.id],
		}),
		router: one(routers, {
			fields: [data_usage_history.router_id],
			references: [routers.id],
		}),
  })
);

export const api_keysRelations = relations(api_keys, ({ one }) => ({
	created_by_user: one(users, {
		fields: [api_keys.created_by],
		references: [users.id],
	}),
}));

// ============ EXPORT ALL TABLES ============


export type Users = typeof users.$inferSelect;
export type NewUsers = typeof users.$inferInsert;

export type CompanySettings = typeof company_settings.$inferSelect;
export type NewCompanySettings = typeof company_settings.$inferInsert;

export type Routers = typeof routers.$inferSelect;
export type NewRouters = typeof routers.$inferInsert;

export type ServicePlans = typeof service_plans.$inferSelect;
export type NewServicePlans = typeof service_plans.$inferInsert;

export type Customers = typeof customers.$inferSelect;
export type NewCustomers = typeof customers.$inferInsert;

export type CustomerServiceHistory =
	typeof customer_service_history.$inferSelect;
export type NewCustomerServiceHistory =
	typeof customer_service_history.$inferInsert;

export type PPPoEProfiles = typeof pppoe_profiles.$inferSelect;
export type NewPPPoEProfiles = typeof pppoe_profiles.$inferInsert;

export type PPPoESecrets = typeof pppoe_secrets.$inferSelect;
export type NewPPPoESecrets = typeof pppoe_secrets.$inferInsert;

export type HotspotServerProfiles = typeof hotspot_server_profiles.$inferSelect;
export type NewHotspotServerProfiles =
	typeof hotspot_server_profiles.$inferInsert;

export type HotspotServers = typeof hotspot_servers.$inferSelect;
export type NewHotspotServers = typeof hotspot_servers.$inferInsert;

export type HotspotProfiles = typeof hotspot_profiles.$inferSelect;
export type NewHotspotProfiles = typeof hotspot_profiles.$inferInsert;

export type HotspotUsers = typeof hotspot_users.$inferSelect;
export type NewHotspotUsers = typeof hotspot_users.$inferInsert;

export type HotspotGroups = typeof hotspot_groups.$inferSelect;
export type NewHotspotGroups = typeof hotspot_groups.$inferInsert;

export type HotspotBatch = typeof hotspot_batch.$inferSelect;
export type NewHotspotBatch = typeof hotspot_batch.$inferInsert;

export type HotspotUserBatch = typeof hotspot_user_batch.$inferSelect;
export type NewHotspotUserBatch = typeof hotspot_user_batch.$inferInsert;

export type Vouchers = typeof vouchers.$inferSelect;
export type NewVouchers = typeof vouchers.$inferInsert;

export type Invoices = typeof invoices.$inferSelect;
export type NewInvoices = typeof invoices.$inferInsert;

export type Payments = typeof payments.$inferSelect;
export type NewPayments = typeof payments.$inferInsert;

export type FinancialTransactions = typeof financial_transactions.$inferSelect;
export type NewFinancialTransactions =
	typeof financial_transactions.$inferInsert;

export type BandwidthUsage = typeof bandwidth_usage.$inferSelect;
export type NewBandwidthUsage = typeof bandwidth_usage.$inferInsert;

export type NotificationSettings = typeof notification_settings.$inferSelect;
export type NewNotificationSettings = typeof notification_settings.$inferInsert;

export type NotificationTemplates = typeof notification_templates.$inferSelect;
export type NewNotificationTemplates =
	typeof notification_templates.$inferInsert;

export type Tasks = typeof tasks.$inferSelect;
export type NewTasks = typeof tasks.$inferInsert;

export type TaskComments = typeof task_comments.$inferSelect;
export type NewTaskComments = typeof task_comments.$inferInsert;

export type Schedules = typeof schedules.$inferSelect;
export type NewSchedules = typeof schedules.$inferInsert;

export type Notes = typeof notes.$inferSelect;
export type NewNotes = typeof notes.$inferInsert;

export type SystemLogs = typeof system_logs.$inferSelect;
export type NewSystemLogs = typeof system_logs.$inferInsert;

export type PaymentMethods = typeof payment_methods.$inferSelect;
export type NewPaymentMethods = typeof payment_methods.$inferInsert;

export type DataUsageHistory = typeof data_usage_history.$inferSelect;
export type NewDataUsageHistory = typeof data_usage_history.$inferInsert;

export type ApiKeys = typeof api_keys.$inferSelect;
export type NewApiKeys = typeof api_keys.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
export type Action = typeof actions.$inferSelect;
export type NewAction = typeof actions.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type NewRolePermission = typeof rolePermissions.$inferInsert;

export const allTables = {
	bandwidth_usage,
	customers,
	customer_service_history,
	data_usage_history,
	financial_transactions,
	hotspot_batch,
	hotspot_groups,
	hotspot_profiles,
	hotspot_server_profiles,
	hotspot_servers,
	hotspot_user_batch,
	hotspot_users,
	invoices,
	notes,
	payment_methods,
	payments,
	pppoe_profiles,
	pppoe_secrets,
	roles,
	service_plans,
	schedules,
	tasks,
	task_comments,
	users,
	vouchers,
	system_logs,
	api_keys,
};