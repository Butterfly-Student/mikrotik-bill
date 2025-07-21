// schema.ts - Drizzle Schema Definition
import {
	pgTable,
	serial,
	text,
	varchar,
	bigint,
	timestamp,
	boolean,
	decimal,
	integer,
	uuid,
	inet,
	bigserial,
	date,
	time,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ========================================
// FREERADIUS TABLES
// ========================================

export const radcheck = pgTable("radcheck", {
	id: serial("id").primaryKey(),
	username: text("username").notNull().default(""),
	attribute: text("attribute").notNull().default(""),
	op: varchar("op", { length: 2 }).notNull().default("=="),
	value: text("value").notNull().default(""),
});

export const radreply = pgTable("radreply", {
	id: serial("id").primaryKey(),
	username: text("username").notNull().default(""),
	attribute: text("attribute").notNull().default(""),
	op: varchar("op", { length: 2 }).notNull().default("="),
	value: text("value").notNull().default(""),
});

export const radgroupcheck = pgTable("radgroupcheck", {
	id: serial("id").primaryKey(),
	groupname: text("groupname").notNull().default(""),
	attribute: text("attribute").notNull().default(""),
	op: varchar("op", { length: 2 }).notNull().default("=="),
	value: text("value").notNull().default(""),
});

export const radgroupreply = pgTable("radgroupreply", {
	id: serial("id").primaryKey(),
	groupname: text("groupname").notNull().default(""),
	attribute: text("attribute").notNull().default(""),
	op: varchar("op", { length: 2 }).notNull().default("="),
	value: text("value").notNull().default(""),
});

export const radusergroup = pgTable("radusergroup", {
	id: serial("id").primaryKey(),
	username: text("username").notNull().default(""),
	groupname: text("groupname").notNull().default(""),
	priority: integer("priority").notNull().default(0),
});

export const radacct = pgTable("radacct", {
	radacctid: bigserial("radacctid", { mode: "bigint" }).primaryKey(),
	acctsessionid: text("acctsessionid").notNull(),
	acctuniqueid: text("acctuniqueid").notNull(),
	username: text("username"),
	groupname: text("groupname"),
	realm: text("realm"),
	nasipaddress: inet("nasipaddress").notNull(),
	nasportid: text("nasportid"),
	nasporttype: text("nasporttype"),
	acctstarttime: timestamp("acctstarttime", { withTimezone: true }),
	acctupdatetime: timestamp("acctupdatetime", { withTimezone: true }),
	acctstoptime: timestamp("acctstoptime", { withTimezone: true }),
	acctinterval: bigint("acctinterval", { mode: "number" }),
	acctsessiontime: bigint("acctsessiontime", { mode: "number" }),
	acctauthentic: text("acctauthentic"),
	connectinfo_start: text("connectinfo_start"),
	connectinfo_stop: text("connectinfo_stop"),
	acctinputoctets: bigint("acctinputoctets", { mode: "number" }),
	acctoutputoctets: bigint("acctoutputoctets", { mode: "number" }),
	calledstationid: text("calledstationid"),
	callingstationid: text("callingstationid"),
	acctterminatecause: text("acctterminatecause"),
	servicetype: text("servicetype"),
	framedprotocol: text("framedprotocol"),
	framedipaddress: inet("framedipaddress"),
	framedipv6address: inet("framedipv6address"),
	framedipv6prefix: inet("framedipv6prefix"),
	framedinterfaceid: text("framedinterfaceid"),
	delegatedipv6prefix: inet("delegatedipv6prefix"),
	class: text("class"),
	servicecategory: varchar("service_category", { length: 20 }).default("pppoe"),
	voucherid: integer("voucher_id"),
	batchid: integer("batch_id"),
});

// ========================================
// CUSTOM TABLES
// ========================================

export const profiles = pgTable("profiles", {
	id: uuid("id")
		.primaryKey()
		.default(sql`uuid_generate_v4()`),
	name: varchar("name", { length: 255 }).notNull(),
	validity: varchar("validity", { length: 50 }).notNull(),
	timeLimit: varchar("time_limit", { length: 50 }).notNull(),
	dataLimit: varchar("data_limit", { length: 50 }).notNull(),
	price: decimal("price", { precision: 10, scale: 2 }).notNull().default("0"),
	sellingPrice: decimal("selling_price", { precision: 10, scale: 2 })
		.notNull()
		.default("0"),
	bandwidthUp: bigint("bandwidth_up", { mode: "number" }),
	bandwidthDown: bigint("bandwidth_down", { mode: "number" }),
	simultaneousUse: integer("simultaneous_use").default(1),
	radiusGroup: varchar("radius_group", { length: 50 }),
	mikrotikProfile: varchar("mikrotik_profile", { length: 50 }),
	description: text("description"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { withTimezone: true }).default(
		sql`now()`
	),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(
		sql`now()`
	),
});

export const batches = pgTable("batches", {
	id: serial("id").primaryKey(),
	batchName: varchar("batch_name", { length: 255 }).notNull(),
	profileId: uuid("profile_id")
		.notNull()
		.references(() => profiles.id, { onDelete: "cascade" }),
	profileName: varchar("profile_name", { length: 255 }).notNull(),
	quantity: integer("quantity").notNull(),
	usedCount: integer("used_count").default(0),
	unusedCount: integer("unused_count").default(0),
	server: varchar("server", { length: 50 }).default("all"),
	userMode: varchar("user_mode", { length: 50 }).default("username_password"),
	nameLength: integer("name_length").default(4),
	prefix: varchar("prefix", { length: 10 }).default("FH"),
	characterType: varchar("character_type", { length: 50 }).default(
		"random_abcd"
	),
	timeLimit: varchar("time_limit", { length: 50 }),
	dataLimit: varchar("data_limit", { length: 50 }),
	comment: text("comment"),
	createdBy: varchar("created_by", { length: 50 }),
	batchStatus: varchar("batch_status", { length: 20 }).default("active"),
	expiryDate: date("expiry_date"),
	createdAt: timestamp("created_at", { withTimezone: true }).default(
		sql`now()`
	),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(
		sql`now()`
	),
});

export const vouchers = pgTable("vouchers", {
	id: serial("id").primaryKey(),
	batchId: integer("batch_id")
		.notNull()
		.references(() => batches.id, { onDelete: "cascade" }),
	username: varchar("username", { length: 255 }).notNull(),
	password: varchar("password", { length: 255 }).notNull(),
	profile: varchar("profile", { length: 255 }).notNull(),
	validity: varchar("validity", { length: 50 }).notNull(),
	timeLimit: varchar("time_limit", { length: 50 }),
	dataLimit: varchar("data_limit", { length: 50 }),
	price: decimal("price", { precision: 10, scale: 2 }).default("0"),
	sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }).default(
		"0"
	),
	used: boolean("used").default(false),
	usedAt: timestamp("used_at", { withTimezone: true }),
	firstLogin: timestamp("first_login", { withTimezone: true }),
	lastLogin: timestamp("last_login", { withTimezone: true }),
	totalSessions: integer("total_sessions").default(0),
	totalTimeUsed: bigint("total_time_used", { mode: "number" }).default(0),
	totalDataUsed: bigint("total_data_used", { mode: "number" }).default(0),
	macAddress: varchar("mac_address", { length: 17 }),
	ipAddress: inet("ip_address"),
	nasIpAddress: inet("nas_ip_address"),
	voucherStatus: varchar("voucher_status", { length: 20 }).default("unused"),
	expiryDate: timestamp("expiry_date", { withTimezone: true }),
	createdAt: timestamp("created_at", { withTimezone: true }).default(
		sql`now()`
	),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(
		sql`now()`
	),
});

export const customers = pgTable("customers", {
	id: uuid("id")
		.primaryKey()
		.default(sql`uuid_generate_v4()`),
	username: varchar("username", { length: 50 }).notNull(),
	password: varchar("password", { length: 255 }),
	fullName: varchar("full_name", { length: 100 }).notNull(),
	alamat: text("alamat"),
	kota: varchar("kota", { length: 50 }),
	nomorWa: varchar("nomor_wa", { length: 20 }),
	nomorHp: varchar("nomor_hp", { length: 20 }),
	email: varchar("email", { length: 100 }),
	tempatLahir: varchar("tempat_lahir", { length: 50 }),
	tanggalLahir: date("tanggal_lahir"),
	pekerjaan: varchar("pekerjaan", { length: 50 }),
	serviceType: varchar("service_type", { length: 20 }).default("pppoe"),
	paketLangganan: varchar("paket_langganan", { length: 50 }),
	hargaBulanan: decimal("harga_bulanan", { precision: 10, scale: 2 }).default(
		"0.00"
	),
	tanggalAktif: date("tanggal_aktif"),
	tanggalExpired: date("tanggal_expired"),
	statusCustomer: varchar("status_customer", { length: 20 }).default(
		"terminate"
	),
	catatan: text("catatan"),
	salesPerson: varchar("sales_person", { length: 50 }),
	referral: varchar("referral", { length: 50 }),
	createdAt: timestamp("created_at", { withTimezone: true }).default(
		sql`now()`
	),
	updatedAt: timestamp("updated_at", { withTimezone: true }).default(
		sql`now()`
	),
});

export const paketLayanan = pgTable("paket_layanan", {
	id: uuid("id")
		.primaryKey()
		.default(sql`uuid_generate_v4()`),
	namaPaket: varchar("nama_paket", { length: 50 }).notNull(),
	serviceType: varchar("service_type", { length: 20 }).notNull(),
	kecepatanUp: varchar("kecepatan_up", { length: 20 }),
	kecepatanDown: varchar("kecepatan_down", { length: 20 }),
	bandwidthUp: bigint("bandwidth_up", { mode: "number" }),
	bandwidthDown: bigint("bandwidth_down", { mode: "number" }),
	hargaBulanan: decimal("harga_bulanan", { precision: 10, scale: 2 }).notNull(),
	hargaPemasangan: decimal("harga_pemasangan", {
		precision: 10,
		scale: 2,
	}).default("0.00"),
	deskripsi: text("deskripsi"),
	radiusGroup: varchar("radius_group", { length: 50 }),
	mikrotikProfile: varchar("mikrotik_profile", { length: 50 }),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { withTimezone: true }).default(
		sql`now()`
	),
});

// // ========================================
// // FUNCTIONS AND UTILITIES
// // ========================================

