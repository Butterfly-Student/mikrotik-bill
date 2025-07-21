import { NextRequest, NextResponse } from "next/server";
import { HotspotGroupService } from "@/database/function/hotspot";
import { z } from "zod";

export const groupSchema = z.object({
	group_name: z.string().min(1, "Group name is required"),
	description: z.string().optional(),
	profile_id: z.number().optional(),
});

const groupService = new HotspotGroupService();

export async function GET() {
	try {
		const groups = await groupService.getGroups();
		return NextResponse.json({
			success: true,
			data: groups,
		});
	} catch (error) {
		console.error("Error getting groups:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch groups" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validatedData = groupSchema.parse(body);

		const group = await groupService.createGroup(validatedData);
		return NextResponse.json(
			{
				success: true,
				data: group,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating group:", error);
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ success: false, error: "Invalid data", details: error.errors },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ success: false, error: "Failed to create group" },
			{ status: 500 }
		);
	}
}
