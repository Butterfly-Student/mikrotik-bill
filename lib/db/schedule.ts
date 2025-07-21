import { db } from "./index";
import { scheduledTasks, reminderTemplates } from "./schema/system";
import { users } from "./schema/users";
import { eq, desc, and, lte, ilike, or } from "drizzle-orm";

export interface CreateScheduledTaskData {
	task_name: string;
	task_type: string;
	template_id?: number;
	target_type: string;
	target_ids?: any;
	schedule_type: string;
	schedule_time: string;
	schedule_date?: Date;
	next_run: Date;
	created_by: number;
}

export interface ScheduledTaskFilters {
	task_type?: string;
	target_type?: string;
	schedule_type?: string;
	status?: string;
	search?: string;
	limit?: number;
	offset?: number;
}

export async function createScheduledTask(data: CreateScheduledTaskData) {
	const [task] = await db
		.insert(scheduledTasks)
		.values({
			...data,
			created_at: new Date(),
			updated_at: new Date(),
		})
		.returning();

	return task;
}

export async function getScheduledTasks(filters: ScheduledTaskFilters = {}) {
	const {
		task_type,
		target_type,
		schedule_type,
		status,
		search,
		limit = 50,
		offset = 0,
	} = filters;

	let query = db
		.select({
			id: scheduledTasks.id,
			task_name: scheduledTasks.task_name,
			task_type: scheduledTasks.task_type,
			target_type: scheduledTasks.target_type,
			target_ids: scheduledTasks.target_ids,
			schedule_type: scheduledTasks.schedule_type,
			schedule_time: scheduledTasks.schedule_time,
			schedule_date: scheduledTasks.schedule_date,
			last_run: scheduledTasks.last_run,
			next_run: scheduledTasks.next_run,
			status: scheduledTasks.status,
			created_at: scheduledTasks.created_at,
			template: {
				id: reminderTemplates.id,
				name: reminderTemplates.name,
				type: reminderTemplates.type,
			},
			created_by_user: {
				id: users.id,
				username: users.username,
				full_name: users.full_name,
			},
		})
		.from(scheduledTasks)
		.leftJoin(
			reminderTemplates,
			eq(scheduledTasks.template_id, reminderTemplates.id)
		)
		.leftJoin(users, eq(scheduledTasks.created_by, users.id))
		.orderBy(desc(scheduledTasks.next_run));

	const conditions = [];

	if (task_type) {
		conditions.push(eq(scheduledTasks.task_type, task_type));
	}

	if (target_type) {
		conditions.push(eq(scheduledTasks.target_type, target_type));
	}

	if (schedule_type) {
		conditions.push(eq(scheduledTasks.schedule_type, schedule_type));
	}

	if (status) {
		conditions.push(eq(scheduledTasks.status, status));
	}

	if (search) {
		conditions.push(
			or(
				ilike(scheduledTasks.task_name, `%${search}%`),
				ilike(reminderTemplates.name, `%${search}%`)
			)
		);
	}

	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	const tasks = await query.limit(limit).offset(offset);

	return tasks;
}

export async function getScheduledTaskById(id: number) {
	const task = await db.query.scheduledTasks.findFirst({
		where: eq(scheduledTasks.id, id),
		with: {
			template: true,
			created_by_user: {
				columns: {
					id: true,
					username: true,
					full_name: true,
				},
			},
		},
	});

	return task;
}

export async function updateScheduledTask(
	id: number,
	data: Partial<CreateScheduledTaskData>
) {
	const [updated] = await db
		.update(scheduledTasks)
		.set({
			...data,
			updated_at: new Date(),
		})
		.where(eq(scheduledTasks.id, id))
		.returning();

	return updated;
}

export async function updateTaskLastRun(id: number, nextRun?: Date) {
	const updateData: any = {
		last_run: new Date(),
		updated_at: new Date(),
	};

	if (nextRun) {
		updateData.next_run = nextRun;
	}

	const [updated] = await db
		.update(scheduledTasks)
		.set(updateData)
		.where(eq(scheduledTasks.id, id))
		.returning();

	return updated;
}

export async function deleteScheduledTask(id: number) {
	const [deleted] = await db
		.delete(scheduledTasks)
		.where(eq(scheduledTasks.id, id))
		.returning();

	return deleted;
}

export async function getTasksDueForExecution() {
	const now = new Date();

	const tasks = await db
		.select()
		.from(scheduledTasks)
		.where(
			and(
				eq(scheduledTasks.status, "active"),
				lte(scheduledTasks.next_run, now)
			)
		)
		.orderBy(scheduledTasks.next_run);

	return tasks;
}

// Reminder Templates
export async function createReminderTemplate(data: {
	name: string;
	type: string;
	target_audience: string;
	subject: string;
	message: string;
	send_via?: string;
}) {
	const [template] = await db
		.insert(reminderTemplates)
		.values({
			...data,
			created_at: new Date(),
			updated_at: new Date(),
		})
		.returning();

	return template;
}

export async function getReminderTemplates(
	filters: {
		type?: string;
		target_audience?: string;
		is_active?: boolean;
		limit?: number;
		offset?: number;
	} = {}
) {
	const { type, target_audience, is_active, limit = 50, offset = 0 } = filters;

	let query = db
		.select()
		.from(reminderTemplates)
		.orderBy(desc(reminderTemplates.created_at));

	const conditions = [];

	if (type) {
		conditions.push(eq(reminderTemplates.type, type));
	}

	if (target_audience) {
		conditions.push(eq(reminderTemplates.target_audience, target_audience));
	}

	if (is_active !== undefined) {
		conditions.push(eq(reminderTemplates.is_active, is_active));
	}

	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	const templates = await query.limit(limit).offset(offset);

	return templates;
}

export async function getReminderTemplateById(id: number) {
	const template = await db.query.reminderTemplates.findFirst({
		where: eq(reminderTemplates.id, id),
	});

	return template;
}

export async function updateReminderTemplate(
	id: number,
	data: {
		name?: string;
		type?: string;
		target_audience?: string;
		subject?: string;
		message?: string;
		send_via?: string;
		is_active?: boolean;
	}
) {
	const [updated] = await db
		.update(reminderTemplates)
		.set({
			...data,
			updated_at: new Date(),
		})
		.where(eq(reminderTemplates.id, id))
		.returning();

	return updated;
}

export async function deleteReminderTemplate(id: number) {
	const [deleted] = await db
		.delete(reminderTemplates)
		.where(eq(reminderTemplates.id, id))
		.returning();

	return deleted;
}
