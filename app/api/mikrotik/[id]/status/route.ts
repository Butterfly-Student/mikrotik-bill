import { routers } from "@/database/schema/mikrotik";
import { db } from "@/lib/db/index";
import { count, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		// Get status counts
		const statusCounts = await db
			.select({
				status: routers.status,
				count: count(),
			})
			.from(routers)
			.groupBy(routers.status);

		// Get active/inactive counts
		const activeCounts = await db
			.select({
				is_active: routers.is_active,
				count: count(),
			})
			.from(routers)
			.groupBy(routers.is_active);

		// Get total count
		const [{ total }] = await db.select({ total: count() }).from(routers);

		// Get recent routers
		const recentRouters = await db
			.select({
				id: routers.id,
				name: routers.name,
				ip_address: routers.ip_address,
				status: routers.status,
				last_seen: routers.last_seen,
			})
			.from(routers)
			.orderBy(desc(routers.last_seen))
			.limit(5);

		return NextResponse.json({
			success: true,
			data: {
				total,
				status_counts: statusCounts,
				active_counts: activeCounts,
				recent_routers: recentRouters,
			},
		});
	} catch (error) {
		console.error("Error getting router status:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to get router status" },
			{ status: 500 }
		);
	}
}
