// app/api/mikrotik/pppoe/profiles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { type MikrotikAPI } from "@/lib/mikrotik";
import { getMikrotikService } from "@/lib/mikrotik-singeleton";

// Get MikroTik configuration from system config


// GET - List all PPPoE profiles
export async function GET(request: NextRequest) {
	try {
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

		const mikrotikService: MikrotikAPI = await getMikrotikService();

		// Get PPPoE profiles
		const profiles = await mikrotikService.getPPPoEProfiles();

		// Apply search filter
		let filteredProfiles = profiles;
		if (search) {
			const searchLower = search.toLowerCase();
			filteredProfiles = filteredProfiles.filter(
				(profile: any) =>
					(profile.name && profile.name.toLowerCase().includes(searchLower)) ||
					(profile.comment &&
						profile.comment.toLowerCase().includes(searchLower))
			);
		}

		// Transform and limit results
		const transformedProfiles = filteredProfiles
			.slice(0, limit)
			.map((profile: any) => ({
				id: profile.id || "",
				name: profile.name || "",
				localAddress: profile["local-address"] || "",
				remoteAddress: profile["remote-address"] || "",
				bridgePort: profile["bridge-port"] || "",
				interface: profile.interface || "",
				rateLimit: profile["rate-limit"] || "",
				sessionTimeout: profile["session-timeout"] || "",
				idleTimeout: profile["idle-timeout"] || "",
				keepaliveTimeout: profile["keepalive-timeout"] || "",
				onlyOne: profile["only-one"] || "",
				addressList: profile["address-list"] || "",
				dnsServer: profile["dns-server"] || "",
				winsServer: profile["wins-server"] || "",
				comment: profile.comment || "",
				default: Boolean(profile.default),
			}));

		return NextResponse.json({
			success: true,
			data: transformedProfiles,
			total: transformedProfiles.length,
			filtered: filteredProfiles.length !== profiles.length,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Error fetching PPPoE profiles:", error);

		if (error instanceof Error) {
			if (error.message.includes("configuration")) {
				return NextResponse.json(
					{
						success: false,
						error: "MikroTik configuration not found or incomplete",
						message:
							"Please configure MikroTik settings in system configuration",
					},
					{ status: 400 }
				);
			}
			if (error.message.includes("connection")) {
				return NextResponse.json(
					{
						success: false,
						error: "Failed to connect to MikroTik router",
						message:
							"Please check MikroTik router connectivity and credentials",
					},
					{ status: 503 }
				);
			}
		}

		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
				message: "An unexpected error occurred while fetching PPPoE profiles",
			},
			{ status: 500 }
		);
	}
}

// POST - Create new PPPoE profile
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {
			name,
			localAddress,
			remoteAddress,
			bridgePort,
			interface: interfaceName,
			rateLimit,
			sessionTimeout,
			idleTimeout,
			keepaliveTimeout,
			onlyOne,
			addressList,
			dnsServer,
			winsServer,
			comment,
		} = body;

		// Validate required fields
		if (!name) {
			return NextResponse.json(
				{
					success: false,
					error: "Profile name is required",
				},
				{ status: 400 }
			);
		}

		// Validate name format
		if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
			return NextResponse.json(
				{
					success: false,
					error:
						"Profile name can only contain letters, numbers, dots, underscores, and hyphens",
				},
				{ status: 400 }
			);
		}

		const mikrotikService: MikrotikAPI = await getMikrotikService();

		// Check if profile already exists
		const existingProfiles = await mikrotikService.getPPPoEProfiles();
		const profileExists = existingProfiles.some(
			(profile: any) => profile.name === name
		);

		if (profileExists) {
			return NextResponse.json(
				{
					success: false,
					error: "Profile with this name already exists",
				},
				{ status: 409 }
			);
		}

		// Create profile data
		const profileData: any = { name };

		if (localAddress) profileData["local-address"] = localAddress;
		if (remoteAddress) profileData["remote-address"] = remoteAddress;
		if (bridgePort) profileData["bridge-port"] = bridgePort;
		if (interfaceName) profileData.interface = interfaceName;
		if (rateLimit) profileData["rate-limit"] = rateLimit;
		if (sessionTimeout) profileData["session-timeout"] = sessionTimeout;
		if (idleTimeout) profileData["idle-timeout"] = idleTimeout;
		if (keepaliveTimeout) profileData["keepalive-timeout"] = keepaliveTimeout;
		if (onlyOne) profileData["only-one"] = onlyOne;
		if (addressList) profileData["address-list"] = addressList;
		if (dnsServer) profileData["dns-server"] = dnsServer;
		if (winsServer) profileData["wins-server"] = winsServer;
		if (comment) profileData.comment = comment;

		// Add profile
		const result = await mikrotikService.addPPPoEProfile(profileData);

		return NextResponse.json({
			success: true,
			message: "PPPoE profile created successfully",
			data: {
				id: result,
				...profileData,
				default: false,
			},
		});
	} catch (error) {
		console.error("Error creating PPPoE profile:", error);

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
		}

		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
				message: "Failed to create PPPoE profile",
			},
			{ status: 500 }
		);
	}
}
