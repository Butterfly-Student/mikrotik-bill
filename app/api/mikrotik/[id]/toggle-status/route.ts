import { routers } from "@/database/schema/mikrotik";
import { db } from "@/lib/db/index";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const routerId = parseInt(params.id);

		if (isNaN(routerId)) {
			return NextResponse.json(
				{ success: false, error: "Invalid router ID" },
				{ status: 400 }
			);
		}

		// Get current router
		const [router] = await db
			.select()
			.from(routers)
			.where(eq(routers.id, routerId));

		if (!router) {
			return NextResponse.json(
				{ success: false, error: "Router not found" },
				{ status: 404 }
			);
		}

		// Toggle status
		const [updatedRouter] = await db
			.update(routers)
			.set({
				is_active: !router.is_active,
				updated_at: new Date(),
			})
			.where(eq(routers.id, routerId))
			.returning();

		return NextResponse.json({
			success: true,
			data: updatedRouter,
			message: `Router ${
				updatedRouter.is_active ? "activated" : "deactivated"
			} successfully`,
		});
	} catch (error) {
		console.error("Error toggling router status:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to toggle router status" },
			{ status: 500 }
		);
	}
}
