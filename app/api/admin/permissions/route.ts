import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
	getAllPermissions,
	createPermission,
	hasPermission,
} from "@/lib/db/index";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const userId = Number.parseInt(session.user.id);
		const canRead = await hasPermission(userId, "permissions.view");

		if (!canRead) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const permissions = await getAllPermissions();
		return NextResponse.json(permissions);
	} catch (error) {
		console.error("Error fetching permissions:", error);
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
		const canWrite = await hasPermission(userId, "permissions.write");

		if (!canWrite) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const { name, description, resource, action } = await request.json();

		if (!name || !resource || !action) {
			return NextResponse.json(
				{ error: "Name, resource, and action are required" },
				{ status: 400 }
			);
		}

		const newPermission = await createPermission(
			name,
			description,
			resource,
			action
		);

		return NextResponse.json(newPermission, { status: 201 });
	} catch (error) {
		console.error("Error creating permission:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
