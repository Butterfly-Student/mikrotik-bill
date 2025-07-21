import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getNoteById, completeNote } from "@/lib/db/notes";
import { getUserById, createActivityLog } from "@/lib/db/index";

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const user = await getUserById(session.user.id);
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const note = await getNoteById(params.id);
		if (!note) {
			return NextResponse.json({ error: "Note not found" }, { status: 404 });
		}

		// Check if user can complete this note
		if (
			note.createdBy !== user.id &&
			note.assignedTo !== user.id &&
			user.role !== "admin" &&
			user.role !== "super_admin"
		) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const completedNote = await completeNote(params.id);

		if (completedNote) {
			// Log the activity
			await createActivityLog({
				userId: user.id,
				action: "complete_note",
				resource: "note",
				resourceId: params.id,
				details: `Completed note: ${note.title}`,
			});
		}

		return NextResponse.json({ note: completedNote });
	} catch (error) {
		console.error("Error completing note:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
