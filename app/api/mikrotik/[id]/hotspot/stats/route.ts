import { MikrotikClient } from "@/lib/mikrotik/client";
import { MikrotikHotspot } from "@/lib/mikrotik/services/MikrotikHotspot";
import { NextRequest, NextResponse } from "next/server";

// app/api/mikrotik/[id]/hotspot/stats/route.ts
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	let hotspot: MikrotikHotspot | null = null;

	try {
		const routerId = parseInt(params.id);

		if (isNaN(routerId)) {
			return NextResponse.json(
				{
					success: false,
					message: "Invalid router ID",
				},
				{ status: 400 }
			);
		}

		// Create MikroTik client
		const mikrotikClient = await MikrotikClient.createFromDatabase(routerId);
		hotspot = mikrotikClient as MikrotikHotspot;

		// Get comprehensive hotspot statistics
		const stats = await hotspot.getHotspotStats(routerId);
		const status = await hotspot.getHotspotStatus(routerId);

		return NextResponse.json({
			success: true,
			data: {
				statistics: stats,
				server_status: {
					servers: status.servers,
					active_users_count: status.activeUsers,
					active_users: status.activeUserDetails?.slice(0, 10), // Limit for performance
				},
				last_updated: new Date().toISOString(),
			},
		});
	} catch (error) {
		console.error("❌ Error fetching hotspot stats:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Internal server error",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	} finally {
		if (hotspot) {
			try {
				await hotspot.disconnect();
			} catch (disconnectError) {
				console.error("⚠️ Error disconnecting:", disconnectError);
			}
		}
	}
}

// app/api/mikrotik/[id]/hotspot/sync/route.ts
