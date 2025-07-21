// app/api/hotspot/groups/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { HotspotGroupService } from "@/database/function/hotspot";
import { z } from "zod";
import { groupSchema } from "../route";


const groupService = new HotspotGroupService();

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			return NextResponse.json(
				{ success: false, error: "Invalid group ID" },
				{ status: 400 }
			);
		}

		const group = await groupService.getGroupById(id);
		if (!group) {
			return NextResponse.json(
				{ success: false, error: "Group not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			data: group,
		});
	} catch (error) {
		console.error("Error getting group:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch group" },
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
				{ success: false, error: "Invalid group ID" },
				{ status: 400 }
			);
		}

		const body = await request.json();
		const validatedData = groupSchema.parse(body);

		const group = await groupService.updateGroup(id, validatedData);
		return NextResponse.json({
			success: true,
			data: group,
		});
	} catch (error) {
		console.error("Error updating group:", error);
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ success: false, error: "Invalid data", details: error.errors },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ success: false, error: "Failed to update group" },
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
				{ success: false, error: "Invalid group ID" },
				{ status: 400 }
			);
		}

		await groupService.deleteGroup(id);
		return NextResponse.json({
			success: true,
			message: "Group deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting group:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to delete group" },
			{ status: 500 }
		);
	}
}
