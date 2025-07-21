import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
	getAllUsers,
	createUser,
	hasPermission,
	assignRolesToUser,
} from "@/lib/db/index";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userId = Number.parseInt(session.user.id);
		const canRead = await hasPermission(userId, "users.view");

		if (!canRead) {
			// Return 403 with proper error structure
			return NextResponse.json(
				{
					error: "Forbidden",
					message: "You don't have permission to view users",
					redirectTo: "/unauthorized",
				},
				{ status: 403 }
			);
		}

		const users = await getAllUsers();
		return NextResponse.json(users);
	} catch (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userId = Number.parseInt(session.user.id);
		const canWrite = await hasPermission(userId, "users.write");

		if (!canWrite) {
			return NextResponse.json(
				{
					error: "Forbidden",
					message: "You don't have permission to create users",
					redirectTo: "/unauthorized",
				},
				{ status: 403 }
			);
		}

		const { name, email, username, password, roleIds } = await request.json();

		if (!name || !email || !username || !password) {
			return NextResponse.json(
				{ error: "All fields are required" },
				{ status: 400 }
			);
		}

		// Create user
		const newUser = await createUser(email, username, password, name);

		// Assign roles if provided
		if (roleIds && roleIds.length > 0) {
			await assignRolesToUser(newUser.id, roleIds);
		}

		return NextResponse.json(newUser, { status: 201 });
	} catch (error) {
		console.error("Error creating user:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
