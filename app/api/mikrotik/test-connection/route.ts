import { NextRequest, NextResponse } from "next/server";
import { RouterOSAPI } from "node-routeros";
import { testConnectionSchema } from "@/lib/validator/router";
import {
	handleApiError,
	successResponse,
	ApiError,
} from "@/lib/utils/api-response";
import { createDirectClient } from "@/lib/mikrotik/client";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validatedData = testConnectionSchema.parse(body);

		const conn = createDirectClient({
			host: validatedData.ip_address,
			user: validatedData.username,
			password: validatedData.password,
			port: validatedData.port,
			timeout: validatedData.timeout,
		});

		// Get system resource info
		const systemResource = (await conn).getResources();

		if (!systemResource) {
			throw new ApiError(
				"Unable to retrieve system information",
				422,
				"SYSTEM_INFO_UNAVAILABLE"
			);
		}

		(await conn).disconnect();

		return NextResponse.json({
			data: systemResource,
			success: true,
			message: "Connection successful",
		});
	} catch (error) {
		return handleApiError(error);
	}
}
