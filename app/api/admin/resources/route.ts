import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllResources, createResource, hasPermission } from "@/lib/db/index";

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

		const resources = await getAllResources();
		return NextResponse.json(resources);
	} catch (error) {
		console.error("Error fetching resources:", error);
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

		const { name, description } = await request.json();

		if (!name) {
			return NextResponse.json(
				{ error: "Resource name is required" },
				{ status: 400 }
			);
		}

		const newResource = await createResource(name, description);

		return NextResponse.json(newResource, { status: 201 });
	} catch (error) {
		console.error("Error creating resource:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
