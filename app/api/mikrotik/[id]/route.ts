import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import {
	ApiError,
	handleApiError,
	successResponse,
} from "@/lib/utils/api-response";
import { db } from "@/lib/db/index";
import { routers } from "@/database/schema/users";
import { routerIdSchema } from "@/lib/validator/router";

// DELETE /api/routers/[id]
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		// Validate router ID
		const { id } = routerIdSchema.parse(params);

		// Check if router exists
		const existingRouter = await db
			.select({ id: routers.id })
			.from(routers)
			.where(eq(routers.id, id))
			.limit(1);

		if (existingRouter.length === 0) {
			throw new ApiError("Router not found", 404, "ROUTER_NOT_FOUND");
		}

		// Soft delete by setting is_active to false
		const deletedRouter = await db
			.update(routers)
			.set({
				is_active: false,
				updated_at: new Date(),
			})
			.where(eq(routers.id, id))
			.returning({ id: routers.id });

		if (!deletedRouter[0]) {
			throw new ApiError("Failed to delete router", 500, "DELETION_FAILED");
		}

		return successResponse({ id: deletedRouter[0].id });
	} catch (error) {
		return handleApiError(error);
	}
}

// GET /api/routers/[id]
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = routerIdSchema.parse(params);

		const router = await db
			.select()
			.from(routers)
			.where(eq(routers.id, id))
			.limit(1);

		if (router.length === 0) {
			throw new ApiError("Router not found", 404, "ROUTER_NOT_FOUND");
		}

		return successResponse(router[0]);
	} catch (error) {
		return handleApiError(error);
	}
}
