import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createNote, getNotesByUserRole } from "@/lib/db/notes";
import { getUserById } from "@/lib/db/index";

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const user = await getUserById(session.user.id);
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const notes = await getNotesByUserRole(user.id, user.role);

		return NextResponse.json({ notes });
	} catch (error) {
		console.error("Error fetching notes:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const user = await getUserById(session.user.id);
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const body = await request.json();
		const { title, description, priority, assignedTo, dueDate } = body;

		if (!title) {
			return NextResponse.json({ error: "Title is required" }, { status: 400 });
		}

		const note = await createNote({
			title,
			description,
			priority: priority || "medium",
			assignedTo: assignedTo || null,
			createdBy: user.id,
			dueDate: dueDate ? new Date(dueDate) : null,
		});

		return NextResponse.json({ note }, { status: 201 });
	} catch (error) {
		console.error("Error creating note:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
