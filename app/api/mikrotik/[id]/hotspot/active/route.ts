// ============================================================================
// app/api/mikrotik/hotspot/active/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MikrotikAPI, MikrotikConfig } from "@/lib/mikrotik/main";
import { getSystemConfig } from "@/lib/db/system";


// GET - List all active Hotspot sessions
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const search = searchParams.get("search");
		const server = searchParams.get("server");
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

		const config = await getSystemConfig();
				if (!config || !config.mikrotik_host || !config.mikrotik_username) {
					return NextResponse.json(
						{
							error: "Mikrotik configuration is incomplete",
						},
						{ status: 400 }
					);
				}
		
				const mikrotikConfig: MikrotikConfig = {
					host: config.mikrotik_host,
					username: config.mikrotik_username,
					password: config.mikrotik_password || "",
					port: config.mikrotik_port || 8728,
					ssl: config.mikrotik_ssl || false,
					timeout: 10000,
				};
		
				const mikrotik = new MikrotikAPI(mikrotikConfig);


		// Get active Hotspot sessions
		const sessions = await mikrotik.getActiveHotspotSessions();
		// Apply filters
		let filteredSessions = sessions;

		if (search) {
			const searchLower = search.toLowerCase();
			filteredSessions = filteredSessions.filter(
				(session: any) =>
					(session.user && session.user.toLowerCase().includes(searchLower)) ||
					(session.address &&
						session.address.toLowerCase().includes(searchLower)) ||
					(session["mac-address"] &&
						session["mac-address"].toLowerCase().includes(searchLower))
			);
		}

		if (server) {
			filteredSessions = filteredSessions.filter(
				(session: any) => session.server === server
			);
		}
		// Transform and limit results
		const transformedSessions = filteredSessions
			.slice(0, limit)
			.map((session: any) => ({
				id: session.id || "",
				server: session.server || "",
				user: session.user || "",
				address: session.address || "",
				macAddress: session["mac-address"] || "",
				loginBy: session["login-by"] || "",
				uptime: session.uptime || "",
				sessionTime: session["session-time-left"] || "",
				idleTime: session["idle-time"] || "",
				bytesIn: parseInt(session["bytes-in"]) || 0,
				bytesOut: parseInt(session["bytes-out"]) || 0,
				packetsIn: parseInt(session["packets-in"]) || 0,
				packetsOut: parseInt(session["packets-out"]) || 0,
				radius: Boolean(session.radius),
			}));

		return NextResponse.json({
			success: true,
			sessions: transformedSessions,
			total: transformedSessions.length,
			filtered: filteredSessions.length !== sessions.length,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Error fetching active Hotspot sessions:", error);

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
					"An unexpected error occurred while fetching active Hotspot sessions",
			},
			{ status: 500 }
		);
	}
}
