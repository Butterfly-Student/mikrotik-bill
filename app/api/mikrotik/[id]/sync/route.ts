import { createMikrotikClient } from "@/lib/mikrotik/client";
import { SyncRouterData } from "@/lib/mikrotik/sync";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const routerId = parseInt(params.id);

		if (isNaN(routerId)) {
			return NextResponse.json(
				{ success: false, error: "Invalid router ID" },
				{ status: 400 }
			);
		}

		console.log("🚀 Starting sync for router ID:", routerId);

		// Initialize the profile sync service
		const profileSync = new SyncRouterData(routerId);

		// Perform the sync
		const syncResult = await profileSync.syncProfiles();

		if (syncResult.success) {
			console.log("✅ Sync completed successfully:", syncResult);
			return NextResponse.json({
				success: true,
				message: syncResult.message,
				data: {
					synced: syncResult.synced,
					totalProfiles:
						syncResult.synced.pppoeProfiles + syncResult.synced.hotspotProfiles,
				},
			});
		} else {
			console.error("❌ Sync failed:", syncResult);
			return NextResponse.json(
				{
					success: false,
					error: syncResult.message,
					details: syncResult.errors,
				},
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error("❌ Error during sync process:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to sync MikroTik profiles",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

// Optional: GET method untuk mendapatkan status sync atau data profiles
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const routerId = parseInt(params.id);

		if (isNaN(routerId)) {
			return NextResponse.json(
				{ success: false, error: "Invalid router ID" },
				{ status: 400 }
			);
		}

		// Hanya untuk testing - mendapatkan data raw dari MikroTik
		const client = await createMikrotikClient(routerId);

		const [pppoeProfiles, hotspotProfiles] = await Promise.all([
			client.getPPPoEProfiles(),
			client.getHotspotProfiles(),
		]);

		console.log("PPPoE Profiles:", pppoeProfiles);
		console.log("Hotspot Profiles:", hotspotProfiles);

		return NextResponse.json({
			success: true,
			data: {
				routerId,
				pppoeProfiles: {
					count: pppoeProfiles.length,
					profiles: pppoeProfiles,
				},
				hotspotProfiles: {
					count: hotspotProfiles.length,
					profiles: hotspotProfiles,
				},
			},
		});
	} catch (error) {
		console.error("Error getting profiles:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to get MikroTik profiles",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
