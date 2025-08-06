
import { createMikrotikClient } from "@/lib/utils/mikrotik";
import { NextRequest, NextResponse } from "next/server";

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

		const client = await createMikrotikClient(routerId);
		const systemInfo = await client.getSystemInfo();

		// Tidak disconnect agar koneksi tetap persist
		// await client.disconnect();

		return NextResponse.json({
			success: true,
			data: systemInfo,
		});
	} catch (error) {
		console.error("Error getting system info:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to get system info" },
			{ status: 500 }
		);
	}
}
