import { NextRequest, NextResponse } from "next/server";
import { routers } from "@/database/schema/users";
import { desc, eq } from "drizzle-orm";
import { ApiError, handleApiError, successResponse } from "@/lib/utils/api-response";
import { db } from "@/lib/db/index";
import { createRouterSchema } from "@/lib/validator/router";

// GET /api/routers
export async function GET() {
	try {
		const allRouters = await db
			.select()
			.from(routers)
			.where(eq(routers.is_active, true))
			.orderBy(desc(routers.created_at));
		return successResponse(allRouters);
	} catch (error) {
		return handleApiError(error);
	}
}

// POST /api/routers
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate request body
		const validatedData = createRouterSchema.parse(body);

		// Check if router with same IP already exists
		const existingRouter = await db
			.select({ id: routers.id })
			.from(routers)
			.where(eq(routers.ip_address, validatedData.ip_address))
			.limit(1);

		if (existingRouter.length > 0) {
			throw new ApiError(
				"Router with this IP address already exists",
				409,
				"DUPLICATE_IP_ADDRESS"
			);
		}

		const newRouter = await db
			.insert(routers)
			.values({
				...validatedData,
				status: "offline", // Default status
				updated_at: new Date(),
			})
			.returning();

		if (!newRouter[0]) {
			throw new ApiError("Failed to create router", 500, "CREATION_FAILED");
		}

		return successResponse(newRouter[0], 201);
	} catch (error) {
		return handleApiError(error);
	}
}
