import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
	updateUser,
	deleteUser,
	hasPermission,
	assignRolesToUser,
} from "@/lib/db/index";
import bcrypt from "bcryptjs";

export async function PUT(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userId = Number.parseInt(session.user.id);
		const canWrite = await hasPermission(userId, "users.write");

		if (!canWrite) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const targetUserId = Number.parseInt(params.id);
		const { name, email, username, password, roleIds } = await request.json();

		// Prepare update data
		const updateData: any = { name, email, username };

		// Hash password if provided
		if (password && password.trim() !== "") {
			updateData.password = await bcrypt.hash(password, 10);
		}

		// Update user
		const updatedUser = await updateUser(targetUserId, updateData);

		// Update roles if provided
		if (roleIds) {
			await assignRolesToUser(targetUserId, roleIds);
		}

		return NextResponse.json(updatedUser);
	} catch (error) {
		console.error("Error updating user:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userId = Number.parseInt(session.user.id);
		const canDelete = await hasPermission(userId, "users.delete");

		if (!canDelete) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const targetUserId = Number.parseInt(params.id);

		// Prevent self-deletion
		if (userId === targetUserId) {
			return NextResponse.json(
				{ error: "Cannot delete your own account" },
				{ status: 400 }
			);
		}

		await deleteUser(targetUserId);

		return NextResponse.json({ message: "User deleted successfully" });
	} catch (error) {
		console.error("Error deleting user:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
