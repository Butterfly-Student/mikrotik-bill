import { db } from "./index";
import { adminNotes, type Note, type NewNote } from "./schema/system";
import { eq, or, desc } from "drizzle-orm";

export async function createNote(
	data: Omit<NewNote, "id" | "createdAt" | "updated_at">
): Promise<Note> {
	const [note] = await db
		.insert(adminNotes)
		.values({
			...data,
			created_at: new Date(),
			updated_at: new Date(),
		})
		.returning();

	return note;
}

export async function getNoteById(id: string): Promise<Note | null> {
	const [note] = await db.select().from(adminNotes).where(eq(adminNotes.id, id)).limit(1);
	return note || null;
}

export async function getNotesByUserRole(
	userId: string,
	userRole: string
): Promise<Note[]> {
	if (userRole === "admin" || userRole === "super_admin") {
		return await db.select().from(notes).orderBy(desc(notes.createdAt));
	}

	return await db
		.select()
		.from(adminNotes)
		.where(or(eq(adminNotes.createdBy, userId), eq(adminNotes.assignedTo, userId)))
		.orderBy(desc(adminNotes.createdAt));
}

export async function updateNote(
	id: string,
	data: Partial<NewNote>
): Promise<Note | null> {
	const [note] = await db
		.update(adminNotes)
		.set({
			...data,
			updated_at: new Date(),
		})
		.where(eq(adminNotes.id, id))
		.returning();

	return note || null;
}

export async function completeNote(id: string): Promise<Note | null> {
	const [note] = await db
		.update(adminNotes)
		.set({
			status: "completed",
			completedAt: new Date(),
			updated_at: new Date(),
		})
		.where(eq(adminNotes.id, id))
		.returning();

	return note || null;
}

export async function deleteNote(id: string): Promise<boolean> {
	const result = await db.delete(adminNotes).where(eq(adminNotes.id, id));
	return result.rowCount > 0;
}

export async function getNotesByStatus(status: string): Promise<Note[]> {
	return await db
		.select()
		.from(adminNotes)
		.where(eq(adminNotes.status, status as any))
		.orderBy(desc(adminNotes.created_at));
}
