import { adminNotes } from './schema/system';
import { db } from "./index";
import { users } from "./schema/users";
import { count, eq } from "drizzle-orm";

export interface DashboardStats {
	totalUsers: number;
	activeUsers: number;
	totalNotes: number;
	pendingNotes: number;
	completedNotes: number;
	systemStatus: {
		mikrotikConnected: boolean;
		whatsappConnected: boolean;
		databaseConnected: boolean;
	};
}

export async function getDashboardStats(): Promise<DashboardStats> {
	try {
		// Get user counts
		const [totalUsersResult] = await db.select({ count: count() }).from(users);
		const [activeUsersResult] = await db
			.select({ count: count() })
			.from(users)
			.where(eq(users.status, "active"));

		// Get note counts
		const [totalNotesResult] = await db.select({ count: count() }).from(adminNotes);
		const [pendingadminNotesResult] = await db
			.select({ count: count() })
			.from(adminNotes)
			.where(eq(adminNotes.status, "pending"));
		const [completedNotesResult] = await db
			.select({ count: count() })
			.from(adminNotes)
			.where(eq(adminNotes.status, "completed"));

		return {
			totalUsers: totalUsersResult.count,
			activeUsers: activeUsersResult.count,
			totalNotes: totalNotesResult.count,
			pendingNotes: pendingNotesResult.count,
			completedNotes: completedNotesResult.count,
			systemStatus: {
				mikrotikConnected: false, // Will be checked separately
				whatsappConnected: false, // Will be checked separately
				databaseConnected: true,
			},
		};
	} catch (error) {
		console.error("Error getting dashboard stats:", error);
		throw new Error("Failed to get dashboard stats");
	}
}

export async function getUserStats() {
	const [totalUsers] = await db.select({ count: count() }).from(users);
	const [activeUsers] = await db
		.select({ count: count() })
		.from(users)
		.where(eq(users.status, "active"));
	const [inactiveUsers] = await db
		.select({ count: count() })
		.from(users)
		.where(eq(users.status, "inactive"));

	return {
		total: totalUsers.count,
		active: activeUsers.count,
		inactive: inactiveUsers.count,
	};
}

export async function getNoteStats() {
	const [totalNotes] = await db.select({ count: count() }).from(adminNotes);
	const [pendingNotes] = await db
		.select({ count: count() })
		.from(adminNotes)
		.where(eq(adminNotes.status, "pending"));
	const [inProgressNotes] = await db
		.select({ count: count() })
		.from(adminNotes)
		.where(eq(adminNotes.status, "in_progress"));
	const [completedNotes] = await db
		.select({ count: count() })
		.from(adminNotes)
		.where(eq(adminNotes.status, "completed"));

	return {
		total: totalNotes.count,
		pending: pendingNotes.count,
		inProgress: inProgressNotes.count,
		completed: completedNotes.count,
	};
}
