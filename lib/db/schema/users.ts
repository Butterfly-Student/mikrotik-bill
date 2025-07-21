import {
	pgTable,
	serial,
	varchar,
	text,
	timestamp,
	integer,
	index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
	userRoles: many(userRoles),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
	userRoles: many(userRoles),
	rolePermissions: many(rolePermissions),
}));

export const resourcesRelations = relations(resources, ({ many }) => ({
	permissions: many(permissions),
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

// Types
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
  users,
  roles,
  resources,
  actions,
  permissions,
  userRoles,
  rolePermissions
}