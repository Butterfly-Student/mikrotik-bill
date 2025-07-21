import { NextRequest, NextResponse } from "next/server";

import { MikrotikAPI, MikrotikConfig } from "@/lib/mikrotik/main";
import { getSystemConfig } from "@/lib/db/system";


// GET - List all Hotspot users (vouchers)
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const search = searchParams.get("search");
		const profile = searchParams.get("profile");
		const disabled = searchParams.get("disabled");
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
		// Get Hotspot users
		const users = await mikrotik.getHotspotUsers();

		// Apply filters
		let filteredUsers = users;

		if (search) {
			const searchLower = search.toLowerCase();
			filteredUsers = filteredUsers.filter(
				(user: any) =>
					(user.name && user.name.toLowerCase().includes(searchLower)) ||
					(user.comment && user.comment.toLowerCase().includes(searchLower))
			);
		}

		if (profile) {
			filteredUsers = filteredUsers.filter(
				(user: any) => user.profile === profile
			);
		}

		if (disabled !== null) {
			const isDisabled = disabled === "true";
			filteredUsers = filteredUsers.filter(
				(user: any) => Boolean(user.disabled) === isDisabled
			);
		}

		// Transform and limit results
		const transformedUsers = filteredUsers.slice(0, limit).map((user: any) => ({
			id: user.id || "",
			name: user.name || "",
			password: user.password || "",
			profile: user.profile || "default",
			server: user.server || "all",
			comment: user.comment || "",
			disabled: Boolean(user.disabled),
			bytesIn: parseInt(user["bytes-in"]) || 0,
			bytesOut: parseInt(user["bytes-out"]) || 0,
			packetsIn: parseInt(user["packets-in"]) || 0,
			packetsOut: parseInt(user["packets-out"]) || 0,
			limitUptime: user["limit-uptime"] || "",
			limitBytesIn: user["limit-bytes-in"] || 0,
			limitBytesOut: user["limit-bytes-out"] || 0,
		}));

		return NextResponse.json({
			success: true,
			vouchers: transformedUsers,
			total: transformedUsers.length,
			filtered: filteredUsers.length !== users.length,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Error fetching Hotspot users:", error);

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
				message: "An unexpected error occurred while fetching Hotspot users",
			},
			{ status: 500 }
		);
	}
}

// POST - Create new Hotspot user (voucher)
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		console.log("🚀 ~ body:", body)
		const {
			name,
			password,
			profile = "default",
			server = "all",
			limitUptime,
			limitBytesIn,
			limitBytesOut,
			comment,
			disabled = false,
		} = body;

		// Validate required fields
		if (!name || !password) {
			return NextResponse.json(
				{
					success: false,
					error: "Name and password are required",
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
						"Username can only contain letters, numbers, dots, underscores, and hyphens",
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

		// Check if user already exists
		const existingUsers = await mikrotik.getHotspotUsers();
		const userExists = existingUsers.some((user: any) => user.name === name);

		if (userExists) {
			return NextResponse.json(
				{
					success: false,
					error: "User with this name already exists",
				},
				{ status: 409 }
			);
		}

		// Create user data
		const userData = {
			name,
			password,
			profile,
			server,
			...(limitUptime && { "limit-uptime": limitUptime }),
			...(limitBytesIn && { "limit-bytes-in": limitBytesIn }),
			...(limitBytesOut && { "limit-bytes-out": limitBytesOut }),
			...(comment && { comment }),
			...(disabled && { disabled: "yes" }),
		};

		// Add user
		const result = await mikrotik.addHotspotUser(userData);

		return NextResponse.json({
			success: true,
			message: "Hotspot user created successfully",
			data: {
				id: result,
				...userData,
				disabled: Boolean(disabled),
			},
		});
	} catch (error) {
		console.error("Error creating Hotspot user:", error);

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
				message: "Failed to create Hotspot user",
			},
			{ status: 500 }
		);
	}
}

// DELETE - Delete Hotspot user
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

		// Delete user
		await mikrotik.removeHotspotUser(id || name);

		return NextResponse.json({
			success: true,
			message: "Hotspot user deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting Hotspot user:", error);

		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
				message: "Failed to delete Hotspot user",
			},
			{ status: 500 }
		);
	}
}
