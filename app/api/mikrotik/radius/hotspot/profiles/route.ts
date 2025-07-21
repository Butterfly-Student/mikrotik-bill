// // app/api/hotspot/profiles/route.ts

// import { HotspotBatchService, HotspotGroupService, HotspotProfileService,  HotspotUserService } from "@/database/function/hotspot";
// import { db } from "@/lib/db/index";
// import { randomBytes, randomUUID } from "crypto";
// import { NextRequest, NextResponse } from "next/server";
// import { z } from "zod";


// // Validation schemas
// const HotspotProfileSchema = z.object({
// 	profile_name: z.string().min(1).max(50),
// 	price: z.number().int().min(0).default(0),
// 	sell_price: z.number().int().min(0).default(0),
// 	validity_days: z.number().int().min(1),
// 	session_limit: z.number().int().positive().optional(),
// 	upload_limit: z.number().int().positive().optional(),
// 	download_limit: z.number().int().positive().optional(),
// 	rate_limit: z.string().max(50).optional(),
// 	mikrotik_profile: z.string().max(50).optional(),
// });


// // ========================================
// // HOTSPOT PROFILES API
// // ========================================

// /**
//  * GET /api/hotspot/profiles - Get all profiles
//  */
// export async function GET(request: NextRequest) {
// 	try {
// 		// const profiles = await getAllHotspotProfilesWithUsage();

// 		return NextResponse.json({
// 			success: true,
// 			// data: profiles,
// 			message: "Profiles retrieved successfully",
// 		});
// 	} catch (error) {
// 		console.error("Error getting profiles:", error);
// 		return NextResponse.json(
// 			{
// 				success: false,
// 				error: "Failed to retrieve profiles",
// 				details: error instanceof Error ? error.message : "Unknown error",
// 			},
// 			{ status: 500 }
// 		);
// 	}
// }

// /**
//  * POST /api/hotspot/profiles - Create new profile
//  */
// export async function POST(request: NextRequest) {
// 	try {
// 		// const body = await request.json();

// 		// Validate input
// 		// const validatedData = HotspotProfileSchema.parse(body);

// 		const profileService = new HotspotProfileService();
// 		const groupService = new HotspotGroupService();
// 		const batchService = new HotspotBatchService();
		
// 		// Create profile
// 		const profile = await profileService.createProfile({
// 			profile_name: "1Hour-1MB",
// 			price: 5000,
// 			sell_price: 7000,
// 			validity_days: 1,
// 			session_limit: 60, // 1 menit
// 			upload_limit: 1048576, // 1MB
// 			download_limit: 1048576, // 1MB
// 			rate_limit: "1M/1M",
// 		});
		
// 		// Create group
// 		const group = await groupService.createGroup({
// 			group_name: "Premium Users",
// 			description: "Premium hotspot users",
// 			profile_id: profile.id,
// 		});
		
// 		// Create batch vouchers
// 		const batchResult = await batchService.createBatch({
// 			batch_name: "Voucher Batch 001",
// 			profile_id: profile.id,
// 			group_id: group.id,
// 			length: 8,
// 			prefix: "HSP",
// 			characters: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
// 			password_mode: "same_as_username",
// 			comment: "Test batch vouchers",
// 			shared_users: 1,
// 			disable: false,
// 			created_by: "admin",
// 		}, 100); // Generate 100 vouchers

// 		return NextResponse.json(
// 			{
// 				success: true,
// 				data: {
// 					profile: profile,
// 					group: group,
// 					batch: batchResult,
// 				},
// 				message: "Profile created successfully",
// 			},
// 			{ status: 201 }
// 		);
// 	} catch (error) {
// 		console.error("Error creating profile:", error);

// 		if (error instanceof z.ZodError) {
// 			return NextResponse.json(
// 				{
// 					success: false,
// 					error: "Validation error",
// 					details: error.errors,
// 				},
// 				{ status: 400 }
// 			);
// 		}

// 		return NextResponse.json(
// 			{
// 				success: false,
// 				error: "Failed to create profile",
// 				details: error instanceof Error ? error.message : "Unknown error",
// 			},
// 			{ status: 500 }
// 		);
// 	}
// }
// ========================================
// HOTSPOT PROFILE API ROUTES
// ========================================

// app/api/hotspot/profiles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { HotspotProfileService } from "@/database/function/hotspot";
import { z } from "zod";

export const profileSchema = z.object({
	id: z.number().optional(),
	profile_name: z.string().min(1, "Profile name is required"),
	rate_limit: z.string().optional().default("UNLIMITED"),
	session_limit: z.number().optional().default(300),
	validity_days: z.number(),
	price: z.number().optional(),
	sell_price: z.number().optional(),
	upload_limit: z.number().optional(),
	download_limit: z.number().optional(),
  mikrotik_profile: z.string().optional(),
});

const profileService = new HotspotProfileService();

export async function GET() {
	try {
		const profiles = await profileService.getProfiles();
		return NextResponse.json({
			success: true,
			data: profiles,
		});
	} catch (error) {
		console.error("Error getting profiles:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch profiles" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validatedData = profileSchema.parse(body);

		const profile = await profileService.createProfile(validatedData);
		return NextResponse.json(
			{
				success: true,
				data: profile,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating profile:", error);
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ success: false, error: "Invalid data", details: error.errors },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ success: false, error: "Failed to create profile" },
			{ status: 500 }
		);
	}
}
