import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllActions, createAction, hasPermission } from "@/lib/db/index";

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

		const actions = await getAllActions();
		return NextResponse.json(actions);
	} catch (error) {
		console.error("Error fetching actions:", error);
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
				{ error: "Action name is required" },
				{ status: 400 }
			);
		}

		const newAction = await createAction(name, description);

		return NextResponse.json(newAction, { status: 201 });
	} catch (error) {
		console.error("Error creating action:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
