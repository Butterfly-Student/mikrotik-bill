import { createMikrotikClient } from "@/lib/mikrotik";
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
		const isConnected = await client.testConnection();

		await client.disconnect();

		return NextResponse.json({
			success: true,
			connected: isConnected,
			message: isConnected ? "Connection successful" : "Connection failed",
		});
	} catch (error) {
		console.error("Error testing connection:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to test connection" },
			{ status: 500 }
		);
	}
}
