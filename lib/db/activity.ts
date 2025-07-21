import { db } from "./index";
import { activityLogs } from "./schema/system";
import { users } from "./schema/users";
import { eq, desc, and, gte, lte, ilike, or } from "drizzle-orm";

export interface CreateActivityLogData {
	user_id: number;
	action: string;
	resource_type?: string;
	resource_id?: number;
	details?: any;
	ip_address?: string;
	user_agent?: string;
}

export interface ActivityLogFilters {
	user_id?: number;
	action?: string;
	resource_type?: string;
	date_from?: Date;
	date_to?: Date;
	search?: string;
	limit?: number;
	offset?: number;
}

export async function createActivityLog(data: CreateActivityLogData) {
	const [log] = await db
		.insert(activityLogs)
		.values({
			...data,
			created_at: new Date(),
		})
		.returning();

	return log;
}

export async function getActivityLogs(filters: ActivityLogFilters = {}) {
	const {
		user_id,
		action,
		resource_type,
		date_from,
		date_to,
		search,
		limit = 50,
		offset = 0,
	} = filters;

	let query = db
		.select({
			id: activityLogs.id,
			action: activityLogs.action,
			resource_type: activityLogs.resource_type,
			resource_id: activityLogs.resource_id,
			details: activityLogs.details,
			ip_address: activityLogs.ip_address,
			user_agent: activityLogs.user_agent,
			created_at: activityLogs.created_at,
			user: {
				id: users.id,
				username: users.username,
				full_name: users.full_name,
			},
		})
		.from(activityLogs)
		.leftJoin(users, eq(activityLogs.user_id, users.id))
		.orderBy(desc(activityLogs.created_at));

	const conditions = [];

	if (user_id) {
		conditions.push(eq(activityLogs.user_id, user_id));
	}

	if (action) {
		conditions.push(eq(activityLogs.action, action));
	}

	if (resource_type) {
		conditions.push(eq(activityLogs.resource_type, resource_type));
	}

	if (date_from) {
		conditions.push(gte(activityLogs.created_at, date_from));
	}

	if (date_to) {
		conditions.push(lte(activityLogs.created_at, date_to));
	}

	if (search) {
		conditions.push(
			or(
				ilike(activityLogs.action, `%${search}%`),
				ilike(activityLogs.resource_type, `%${search}%`),
				ilike(users.username, `%${search}%`),
				ilike(users.full_name, `%${search}%`)
			)
		);
	}

	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	const logs = await query.limit(limit).offset(offset);

	return logs;
}

export async function getActivityLogById(id: number) {
	const log = await db.query.activityLogs.findFirst({
		where: eq(activityLogs.id, id),
		with: {
			user: {
				columns: {
					id: true,
					username: true,
					full_name: true,
				},
			},
		},
	});

	return log;
}

export async function deleteOldActivityLogs(daysToKeep = 90) {
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

	const deleted = await db
		.delete(activityLogs)
		.where(lte(activityLogs.created_at, cutoffDate))
		.returning({ id: activityLogs.id });

	return deleted.length;
}
