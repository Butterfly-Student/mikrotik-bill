import { db } from "./index";
import { whatsappNotifications, notesNotifications } from "./schema/system";
import { eq, desc, and, gte, lte, ilike } from "drizzle-orm";

export interface CreateWhatsAppNotificationData {
	recipient_phone: string;
	message: string;
	template_name?: string;
}

export interface WhatsAppNotificationFilters {
	status?: string;
	template_name?: string;
	date_from?: Date;
	date_to?: Date;
	search?: string;
	limit?: number;
	offset?: number;
}

export async function createWhatsAppNotification(
	data: CreateWhatsAppNotificationData
) {
	const [notification] = await db
		.insert(whatsappNotifications)
		.values({
			...data,
			created_at: new Date(),
		})
		.returning();

	return notification;
}

export async function getWhatsAppNotifications(
	filters: WhatsAppNotificationFilters = {}
) {
	const {
		status,
		template_name,
		date_from,
		date_to,
		search,
		limit = 50,
		offset = 0,
	} = filters;

	let query = db
		.select()
		.from(whatsappNotifications)
		.orderBy(desc(whatsappNotifications.created_at));

	const conditions = [];

	if (status) {
		conditions.push(eq(whatsappNotifications.status, status));
	}

	if (template_name) {
		conditions.push(eq(whatsappNotifications.template_name, template_name));
	}

	if (date_from) {
		conditions.push(gte(whatsappNotifications.created_at, date_from));
	}

	if (date_to) {
		conditions.push(lte(whatsappNotifications.created_at, date_to));
	}

	if (search) {
		conditions.push(
			ilike(whatsappNotifications.recipient_phone, `%${search}%`)
		);
	}

	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	const notifications = await query.limit(limit).offset(offset);

	return notifications;
}

export async function updateWhatsAppNotificationStatus(
	id: number,
	status: string,
	errorMessage?: string
) {
	const updateData: any = {
		status,
	};

	if (status === "sent") {
		updateData.sent_at = new Date();
	}

	if (errorMessage) {
		updateData.error_message = errorMessage;
	}

	const [updated] = await db
		.update(whatsappNotifications)
		.set(updateData)
		.where(eq(whatsappNotifications.id, id))
		.returning();

	return updated;
}

export async function getPendingWhatsAppNotifications() {
	const notifications = await db
		.select()
		.from(whatsappNotifications)
		.where(eq(whatsappNotifications.status, "pending"))
		.orderBy(whatsappNotifications.created_at)
		.limit(100);

	return notifications;
}

// Notes Notifications
export async function createNotesNotification(data: {
	note_id: number;
	recipient_phone: string;
	recipient_name: string;
	recipient_role: string;
	message: string;
}) {
	const [notification] = await db
		.insert(notesNotifications)
		.values({
			...data,
			created_at: new Date(),
		})
		.returning();

	return notification;
}

export async function getNotesNotifications(
	filters: {
		note_id?: number;
		status?: string;
		recipient_role?: string;
		limit?: number;
		offset?: number;
	} = {}
) {
	const { note_id, status, recipient_role, limit = 50, offset = 0 } = filters;

	let query = db
		.select()
		.from(notesNotifications)
		.orderBy(desc(notesNotifications.created_at));

	const conditions = [];

	if (note_id) {
		conditions.push(eq(notesNotifications.note_id, note_id));
	}

	if (status) {
		conditions.push(eq(notesNotifications.status, status));
	}

	if (recipient_role) {
		conditions.push(eq(notesNotifications.recipient_role, recipient_role));
	}

	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	const notifications = await query.limit(limit).offset(offset);

	return notifications;
}

export async function updateNotesNotificationStatus(
	id: number,
	status: string,
	errorMessage?: string
) {
	const updateData: any = {
		status,
	};

	if (status === "sent") {
		updateData.sent_at = new Date();
	}

	if (errorMessage) {
		updateData.error_message = errorMessage;
	}

	const [updated] = await db
		.update(notesNotifications)
		.set(updateData)
		.where(eq(notesNotifications.id, id))
		.returning();

	return updated;
}

export async function getPendingNotesNotifications() {
	const notifications = await db
		.select()
		.from(notesNotifications)
		.where(eq(notesNotifications.status, "pending"))
		.orderBy(notesNotifications.created_at)
		.limit(100);

	return notifications;
}
