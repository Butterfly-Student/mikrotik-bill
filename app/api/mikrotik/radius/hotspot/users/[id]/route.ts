// app/api/hotspot/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { HotspotUserService } from "@/database/function/hotspot";
import { z } from "zod";
import { userSchema } from "../route";


const userService = new HotspotUserService();

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			return NextResponse.json(
				{ success: false, error: "Invalid user ID" },
				{ status: 400 }
			);
		}

		const user = await userService.getUserById(id);
		if (!user) {
			return NextResponse.json(
				{ success: false, error: "User not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			data: user,
		});
	} catch (error) {
		console.error("Error getting user:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch user" },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			return NextResponse.json(
				{ success: false, error: "Invalid user ID" },
				{ status: 400 }
			);
		}

		const body = await request.json();
		const validatedData = userSchema.parse(body);

		const user = await userService.updateUser(id, validatedData);
		return NextResponse.json({
			success: true,
			data: user,
		});
	} catch (error) {
		console.error("Error updating user:", error);
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ success: false, error: "Invalid data", details: error.errors },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ success: false, error: "Failed to update user" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			return NextResponse.json(
				{ success: false, error: "Invalid user ID" },
				{ status: 400 }
			);
		}

		await userService.deleteUser(id);
		return NextResponse.json({
			success: true,
			message: "User deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting user:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to delete user" },
			{ status: 500 }
		);
	}
}


// // app/api/hotspot/users/username/[username]/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { HotspotUserService } from "@/database/function/hotspot";

// const userService = new HotspotUserService();

// export async function GET(
// 	request: NextRequest,
// 	{ params }: { params: { username: string } }
// ) {
// 	try {
// 		const user = await userService.getUserByUsername(params.username);
// 		if (!user) {
// 			return NextResponse.json(
// 				{ success: false, error: "User not found" },
// 				{ status: 404 }
// 			);
// 		}

// 		return NextResponse.json({
// 			success: true,
// 			data: user,
// 		});
// 	} catch (error) {
// 		console.error("Error getting user by username:", error);
// 		return NextResponse.json(
// 			{ success: false, error: "Failed to fetch user" },
// 			{ status: 500 }
// 		);
// 	}
// }
