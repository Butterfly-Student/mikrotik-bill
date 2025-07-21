// app/api/hotspot/batches/[id]/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { HotspotBatchService } from "@/database/function/hotspot";
const batchService = new HotspotBatchService();

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			return NextResponse.json(
				{ success: false, error: "Invalid batch ID" },
				{ status: 400 }
			);
		}

		const stats = await batchService.getBatchStats(id);
		return NextResponse.json({
			success: true,
			data: stats,
		});
	} catch (error) {
		console.error("Error getting batch stats:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch batch statistics" },
			{ status: 500 }
		);
	}
}
