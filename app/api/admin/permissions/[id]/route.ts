import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
	updatePermission,
	deletePermission,
	hasPermission,
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
		const canWrite = await hasPermission(userId, "permissions.write");

		if (!canWrite) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const permissionId = Number.parseInt(params.id);
		const { name, description, resourceId, actionId } = await request.json();

		if (!name || !resourceId || !actionId) {
			return NextResponse.json(
				{ error: "Name, resource, and action are required" },
				{ status: 400 }
			);
		}

		const updatedPermission = await updatePermission(permissionId, {
			name,
			description,
			resourceId,
			actionId,
		});

		return NextResponse.json(updatedPermission);
	} catch (error) {
		console.error("Error updating permission:", error);
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
		const canDelete = await hasPermission(userId, "permissions.delete");

		if (!canDelete) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const permissionId = Number.parseInt(params.id);

		await deletePermission(permissionId);

		return NextResponse.json({ message: "Permission deleted successfully" });
	} catch (error) {
		console.error("Error deleting permission:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
