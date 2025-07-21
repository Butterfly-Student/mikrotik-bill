
// app/api/hotspot/profiles/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { HotspotProfileService } from "@/database/function/hotspot";
import { z } from "zod";
import { profileSchema } from "../route";



const profileService = new HotspotProfileService();

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			return NextResponse.json(
				{ success: false, error: "Invalid profile ID" },
				{ status: 400 }
			);
		}

		const profile = await profileService.getProfileById(id);
		if (!profile) {
			return NextResponse.json(
				{ success: false, error: "Profile not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			data: profile,
		});
	} catch (error) {
		console.error("Error getting profile:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch profile" },
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
				{ success: false, error: "Invalid profile ID" },
				{ status: 400 }
			);
		}

		const body = await request.json();
		const validatedData = profileSchema.parse(body);

		const profile = await profileService.updateProfile(id, validatedData);
		return NextResponse.json({
			success: true,
			data: profile,
		});
	} catch (error) {
		console.error("Error updating profile:", error);
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ success: false, error: "Invalid data", details: error.errors },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ success: false, error: "Failed to update profile" },
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
				{ success: false, error: "Invalid profile ID" },
				{ status: 400 }
			);
		}

		await profileService.deleteProfile(id);
		return NextResponse.json({
			success: true,
			message: "Profile deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting profile:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to delete profile" },
			{ status: 500 }
		);
	}
}
