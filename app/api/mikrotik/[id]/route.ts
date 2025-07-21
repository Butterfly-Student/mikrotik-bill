import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc, asc, like, or } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { routers } from "@/database/schema/mikrotik";
import { z } from "zod";
import { updateRouterSchema } from "../route";

// GET /api/routers/[id] - Get router by ID
export async function GET(
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

		return NextResponse.json({
			success: true,
			data: router,
		});
	} catch (error) {
		console.error("Error getting router:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to get router" },
			{ status: 500 }
		);
	}
}

// PUT /api/routers/[id] - Update router
export async function UPDATE(
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

		const body = await request.json();
		const validatedData = updateRouterSchema.parse(body);

		// Check if router exists
		const [existingRouter] = await db
			.select()
			.from(routers)
			.where(eq(routers.id, routerId));

		if (!existingRouter) {
			return NextResponse.json(
				{ success: false, error: "Router not found" },
				{ status: 404 }
			);
		}

		// Check if IP address already exists (if being updated)
		if (
			validatedData.ip_address &&
			validatedData.ip_address !== existingRouter.ip_address
		) {
			const [duplicateRouter] = await db
				.select()
				.from(routers)
				.where(eq(routers.ip_address, validatedData.ip_address));

			if (duplicateRouter) {
				return NextResponse.json(
					{
						success: false,
						error: "Router with this IP address already exists",
					},
					{ status: 400 }
				);
			}
		}

		// Update router
		const [updatedRouter] = await db
			.update(routers)
			.set({
				...validatedData,
				updated_at: new Date(),
			})
			.where(eq(routers.id, routerId))
			.returning();

		return NextResponse.json({
			success: true,
			data: updatedRouter,
		});
	} catch (error) {
		console.error("Error updating router:", error);

		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ success: false, error: "Invalid data", details: error.errors },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ success: false, error: "Failed to update router" },
			{ status: 500 }
		);
	}
}

// DELETE /api/routers/[id] - Delete router
export async function DELETE(
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

		// Check if router exists
		const [existingRouter] = await db
			.select()
			.from(routers)
			.where(eq(routers.id, routerId));

		if (!existingRouter) {
			return NextResponse.json(
				{ success: false, error: "Router not found" },
				{ status: 404 }
			);
		}

		// Delete router
		await db.delete(routers).where(eq(routers.id, routerId));

		return NextResponse.json({
			success: true,
			message: "Router deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting router:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to delete router" },
			{ status: 500 }
		);
	}
}
