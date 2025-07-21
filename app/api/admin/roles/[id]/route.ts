import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
	updateRole,
	deleteRole,
	hasPermission,
	assignPermissionsToRole,
} from "@/lib/db/index";

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
		const canWrite = await hasPermission(userId, "roles.write");

		if (!canWrite) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const roleId = Number.parseInt(params.id);
		const { name, description, permissionIds } = await request.json();

		// Update role
		const updatedRole = await updateRole(roleId, { name, description });

		// Update permissions if provided
		if (permissionIds) {
			await assignPermissionsToRole(roleId, permissionIds);
		}

		return NextResponse.json(updatedRole);
	} catch (error) {
		console.error("Error updating role:", error);
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
		const canDelete = await hasPermission(userId, "roles.delete");

		if (!canDelete) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const roleId = Number.parseInt(params.id);

		await deleteRole(roleId);

		return NextResponse.json({ message: "Role deleted successfully" });
	} catch (error) {
		console.error("Error deleting role:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
