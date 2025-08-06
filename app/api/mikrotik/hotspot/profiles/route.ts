// app/api/mikrotik/radius/hotspot/profiles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { session_profiles } from "@/database/schema/mikrotik";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
	try {
		// Get all session profiles for hotspot
		const profiles = await db
			.select()
			.from(session_profiles)
			.where(eq(session_profiles.type, "hotspot"))
			.orderBy(desc(session_profiles.created_at));

		// Format profiles with pricing info (you might want to add price fields to session_profiles table)
		const formattedProfiles = profiles.map((profile) => ({
			id: profile.id,
			profile_name: profile.name,
			validity_days: 30, // Default, you might want to extract this from limits
			price: 10000, // Default, you might want to add this field to the table
			sell_price: 15000, // Default, you might want to add this field to the table
			type: profile.type,
			bandwidth_config: profile.bandwidth_config,
			limits: profile.limits,
			status: profile.status,
			is_active: profile.is_active,
			created_at: profile.created_at,
		}));

		return NextResponse.json({
			success: true,
			data: formattedProfiles,
		});
	} catch (error) {
		console.error("Error in profiles API:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Internal server error",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { router_id, name, bandwidth_config, limits, comment } = body;

		if (!router_id || !name) {
			return NextResponse.json(
				{
					success: false,
					message: "router_id and name are required",
				},
				{ status: 400 }
			);
		}

		const newProfile = await db
			.insert(session_profiles)
			.values({
				router_id: parseInt(router_id),
				name,
				type: "hotspot",
				bandwidth_config,
				limits,
				comment,
				status: "active",
				is_active: true,
			})
			.returning();

		return NextResponse.json(
			{
				success: true,
				message: "Profile created successfully",
				data: newProfile[0],
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error in profiles API:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Internal server error",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
