// ========================================
// HOTSPOT USER API ROUTES
// ========================================

// app/api/hotspot/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { HotspotUserService } from "@/database/function/hotspot";
import { z } from "zod";

export const userSchema = z.object({
	username: z.string().min(1, "Username is required"),
	password: z.string().min(1, "Password is required"),
	profile_id: z.number().optional(),
	group_id: z.number().optional(),
	status: z.enum(["active", "inactive", "expired"]).default("active"),
	comment: z.string().optional(),
	shared_users: z.number().default(1),
});

const userService = new HotspotUserService();

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get("limit") || "100");
		const offset = parseInt(searchParams.get("offset") || "0");
		const status = searchParams.get("status");

		let users;
		if (status === "active") {
			users = await userService.getActiveUsers();
		} else if (status === "expired") {
			users = await userService.getExpiredUsers();
		} else {
			users = await userService.getUsers(limit, offset);
		}

		return NextResponse.json({
			success: true,
			data: users,
			pagination: {
				limit,
				offset,
				total: users.length,
			},
		});
	} catch (error) {
		console.error("Error getting users:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch users" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validatedData = userSchema.parse(body);

		const user = await userService.createUser(validatedData);
		return NextResponse.json(
			{
				success: true,
				data: user,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating user:", error);
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ success: false, error: "Invalid data", details: error.errors },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ success: false, error: "Failed to create user" },
			{ status: 500 }
		);
	}
}
