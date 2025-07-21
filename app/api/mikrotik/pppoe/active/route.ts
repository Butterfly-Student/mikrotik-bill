// app/api/mikrotik/pppoe/active/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMikrotikService } from "@/lib/mikrotik-singeleton";


// GET - List all active PPPoE sessions
export async function GET(request: NextRequest) {
	try {
		const mikrotikService = await getMikrotikService();

		// Check if MikroTik service is available
		if (!mikrotikService) {
			return NextResponse.json(
				{ error: "MikroTik configuration not found or incomplete" },
				{ status: 500 }
			);
		}
		const searchParams = request.nextUrl.searchParams;
		const search = searchParams.get("search");
		const limit = parseInt(searchParams.get("limit") || "100");

		if (limit < 1 || limit > 1000) {
			return NextResponse.json(
				{
					success: false,
					error: "Limit must be between 1 and 1000",
				},
				{ status: 400 }
			);
		}

		// Get active PPPoE sessions
		const sessions = await mikrotikService.getActivePPPSessions();
		console.log(sessions)
		// Apply search filter
		let filteredSessions = sessions;
		if (search) {
			const searchLower = search.toLowerCase();
			filteredSessions = filteredSessions.filter(
				(session: any) =>
					(session.name && session.name.toLowerCase().includes(searchLower)) ||
					(session.address &&
						session.address.toLowerCase().includes(searchLower)) ||
					(session["caller-id"] &&
						session["caller-id"].toLowerCase().includes(searchLower))
			);
		}

		// Transform and limit results
		const transformedSessions = filteredSessions
			.slice(0, limit)
			.map((session: any) => ({
				id: session.id || "",
				name: session.name || "",
				service: session.service || "",
				address: session.address || "",
				callerId: session["caller-id"] || "",
				uptime: session.uptime || "",
				encoding: session.encoding || "",
				sessionId: session["session-id"] || "",
				radius: Boolean(session.radius),
				limitBytesIn: session["limit-bytes-in"] || 0,
				limitBytesOut: session["limit-bytes-out"] || 0,
			}));

		return NextResponse.json({
			success: true,
			data: transformedSessions,
			total: transformedSessions.length,
			filtered: filteredSessions.length !== sessions.length,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Error fetching active PPPoE sessions:", error);

		if (error instanceof Error) {
			if (error.message.includes("configuration")) {
				return NextResponse.json(
					{
						success: false,
						error: "MikroTik configuration not found or incomplete",
					},
					{ status: 400 }
				);
			}
			if (error.message.includes("connection")) {
				return NextResponse.json(
					{
						success: false,
						error: "Failed to connect to MikroTik router",
					},
					{ status: 503 }
				);
			}
		}

		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
				message:
					"An unexpected error occurred while fetching active PPPoE sessions",
			},
			{ status: 500 }
		);
	}
}
