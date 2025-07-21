// ============================================================================
// app/api/mikrotik/hotspot/profile/route.ts
import { getSystemConfig } from "@/lib/db/system";
import { MikrotikAPI, MikrotikConfig } from "@/lib/mikrotik/main";
import { NextRequest, NextResponse } from "next/server";



// GET - List all Hotspot user profiles
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const search = searchParams.get("search");

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

		// Get Hotspot user profiles
		const profiles = await mikrotik.getHotspotUserProfiles();
		console.log(profiles);

		// Apply search filter
		let filteredProfiles = profiles;
		if (search) {
			const searchLower = search.toLowerCase();
			filteredProfiles = filteredProfiles.filter(
				(profile: any) =>
					profile.name && profile.name.toLowerCase().includes(searchLower)
			);
		}

		// Transform results
		const transformedProfiles = filteredProfiles.map((profile: any) => ({
			id: profile.id || "",
			name: profile.name || "",
			default: Boolean(profile.default),
			sharedUsers: parseInt(profile["shared-users"]) || 1,
			rateLimit: profile["rate-limit"] || "",
			sessionTimeout: profile["session-timeout"] || "",
			idleTimeout: profile["idle-timeout"] || "",
			keepaliveTimeout: profile["keepalive-timeout"] || "",
			statusAutorefresh: profile["status-autorefresh"] || "",
			transparentProxy: Boolean(profile["transparent-proxy"]),
			advertise: profile.advertise || "",
			advertiseUrl: profile["advertise-url"] || "",
			advertiseInterval: profile["advertise-interval"] || "",
			advertiseTimeout: profile["advertise-timeout"] || "",
			onLogin: profile["on-login"] || "",
			onLogout: profile["on-logout"] || "",
		}));

		console.log(transformedProfiles);

		return NextResponse.json({
			success: true,
			profiles: transformedProfiles,
			total: transformedProfiles.length,
			filtered: filteredProfiles.length !== profiles.length,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Error fetching Hotspot user profiles:", error);

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
					"An unexpected error occurred while fetching Hotspot user profiles",
			},
			{ status: 500 }
		);
	}
}

// POST - Create new Hotspot user profile
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		console.log(body);
		const {
			name,
			sharedUsers = 1,
			rateLimit,
			sessionTimeout,
			idleTimeout,
			keepaliveTimeout,
			statusAutorefresh,
			transparentProxy = false,
			advertise,
			advertiseUrl,
			advertiseInterval,
			advertiseTimeout,
			onLogin,
			onLogout,
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

		// Check if profile already exists
		const existingProfiles = await mikrotik.getHotspotUserProfiles();
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
		const profileData = {
			name,
			"shared-users": sharedUsers.toString(),
			...(rateLimit && { "rate-limit": rateLimit }),
			...(sessionTimeout && { "session-timeout": sessionTimeout }),
			...(idleTimeout && { "idle-timeout": idleTimeout }),
			...(keepaliveTimeout && { "keepalive-timeout": keepaliveTimeout }),
			...(statusAutorefresh && { "status-autorefresh": statusAutorefresh }),
			...(transparentProxy && { "transparent-proxy": "yes" }),
			...(advertise && { advertise }),
			...(advertiseUrl && { "advertise-url": advertiseUrl }),
			...(advertiseInterval && { "advertise-interval": advertiseInterval }),
			...(advertiseTimeout && { "advertise-timeout": advertiseTimeout }),
			...(onLogin && { "on-login": onLogin }),
			...(onLogout && { "on-logout": onLogout }),
		};
		console.log(profileData);
		// Add profile
		const result = await mikrotik.addHotspotUserProfile(profileData);

		return NextResponse.json({
			success: true,
			message: "Hotspot user profile created successfully",
			data: {
				id: result,
				name,
				...profileData,
				transparentProxy: Boolean(transparentProxy),
			},
		});
	} catch (error) {
		console.error("Error creating Hotspot user profile:", error);

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
				message: "Failed to create Hotspot user profile",
			},
			{ status: 500 }
		);
	}
}

// PUT - Update Hotspot user profile
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const {
			id,
			name,
			sharedUsers,
			rateLimit,
			sessionTimeout,
			idleTimeout,
			keepaliveTimeout,
			statusAutorefresh,
			transparentProxy,
			advertise,
			advertiseUrl,
			advertiseInterval,
			advertiseTimeout,
			onLogin,
			onLogout,
		} = body;

		// Validate required fields
		if (!id) {
			return NextResponse.json(
				{
					success: false,
					error: "Profile ID is required",
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

		// Create update data
		const updateData: any = {};

		if (name !== undefined) updateData.name = name;
		if (sharedUsers !== undefined)
			updateData["shared-users"] = sharedUsers.toString();
		if (rateLimit !== undefined) updateData["rate-limit"] = rateLimit;
		if (sessionTimeout !== undefined)
			updateData["session-timeout"] = sessionTimeout;
		if (idleTimeout !== undefined) updateData["idle-timeout"] = idleTimeout;
		if (keepaliveTimeout !== undefined)
			updateData["keepalive-timeout"] = keepaliveTimeout;
		if (statusAutorefresh !== undefined)
			updateData["status-autorefresh"] = statusAutorefresh;
		if (transparentProxy !== undefined)
			updateData["transparent-proxy"] = transparentProxy ? "yes" : "no";
		if (advertise !== undefined) updateData.advertise = advertise;
		if (advertiseUrl !== undefined) updateData["advertise-url"] = advertiseUrl;
		if (advertiseInterval !== undefined)
			updateData["advertise-interval"] = advertiseInterval;
		if (advertiseTimeout !== undefined)
			updateData["advertise-timeout"] = advertiseTimeout;
		if (onLogin !== undefined) updateData["on-login"] = onLogin;
		if (onLogout !== undefined) updateData["on-logout"] = onLogout;

		// Update profile
		await mikrotik.updateHotspotUserProfile(id, updateData);

		return NextResponse.json({
			success: true,
			message: "Hotspot user profile updated successfully",
		});
	} catch (error) {
		console.error("Error updating Hotspot user profile:", error);

		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
				message: "Failed to update Hotspot user profile",
			},
			{ status: 500 }
		);
	}
}

// DELETE - Delete Hotspot user profile
export async function DELETE(request: NextRequest) {
	try {
		const body = await request.json();
		const { id, name } = body;

		if (!id && !name) {
			return NextResponse.json(
				{
					success: false,
					error: "Either ID or name is required",
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

		// Delete profile
		await mikrotik.removeHotspotUserProfile(id || name);

		return NextResponse.json({
			success: true,
			message: "Hotspot user profile deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting Hotspot user profile:", error);

		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
				message: "Failed to delete Hotspot user profile",
			},
			{ status: 500 }
		);
	}
}
