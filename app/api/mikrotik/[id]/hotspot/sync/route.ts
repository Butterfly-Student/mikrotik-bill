import { MikrotikClient } from "@/lib/mikrotik/client";
import { MikrotikHotspot } from "@/lib/mikrotik/services/MikrotikHotspot";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
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

		console.log(`🔄 Starting voucher sync for router ${routerId}...`);

		// Create MikroTik client
		const mikrotikClient = await MikrotikClient.createFromDatabase(routerId);
		hotspot = mikrotikClient as MikrotikHotspot;

		// Sync vouchers from MikroTik
		const syncResult = await hotspot.syncVouchersFromMikrotik(routerId);

		console.log(`✅ Voucher sync completed: ${JSON.stringify(syncResult)}`);

		return NextResponse.json({
			success: true,
			message: "Voucher sync completed successfully",
			data: syncResult,
		});
	} catch (error) {
		console.error("❌ Error syncing vouchers:", error);
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
