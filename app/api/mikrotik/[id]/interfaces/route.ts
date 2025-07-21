import { createMikrotikClient } from "@/lib/cache/mikrotik";
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
		const interfaces = await client.getInterfaces();

		console.log("Interfaces:", interfaces);

		return new Response(
			JSON.stringify({
				interfaces,
				count: interfaces.length,
				timestamp: new Date(),
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error getting interfaces:", error);
		return new Response(
			JSON.stringify({
				error: "Failed to get interfaces",
				message: error instanceof Error ? error.message : "Unknown error",
				timestamp: new Date(),
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
}
