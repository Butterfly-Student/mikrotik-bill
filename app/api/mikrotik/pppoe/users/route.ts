// app/api/mikrotik/pppoe/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { type MikrotikAPI } from "@/lib/mikrotik";
import { getMikrotikService } from "@/lib/mikrotik-singeleton";


// GET - List all PPPoE users
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

		const mikrotikService: MikrotikAPI = await getMikrotikService();

		// Get PPPoE users
		const users = await mikrotikService.getPPPoEUsers();

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
			service: user.service || "pppoe",
			localAddress: user["local-address"] || "",
			remoteAddress: user["remote-address"] || "",
			comment: user.comment || "",
			disabled: Boolean(user.disabled),
			lastLoggedOut: user["last-logged-out"] || null,
		}));

		return NextResponse.json({
			success: true,
			data: transformedUsers,
			total: transformedUsers.length,
			filtered: filteredUsers.length !== users.length,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Error fetching PPPoE users:", error);

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
				message: "An unexpected error occurred while fetching PPPoE users",
			},
			{ status: 500 }
		);
	}
}

// POST - Create new PPPoE user
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {
			name,
			password,
			profile,
			service = "pppoe",
			localAddress,
			remoteAddress,
			comment,
			disabled = false,
		} = body;
    console.log(body)
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

		// Validate name format (no spaces, special chars)
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

		const mikrotikService: MikrotikAPI = await getMikrotikService();


		// Check if user already exists
		const existingUsers = await mikrotikService.getPPPoEUsers();
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
			service,
			...(localAddress && { "local-address": localAddress }),
			...(remoteAddress && { "remote-address": remoteAddress }),
			...(comment && { comment }),
			...(disabled && { disabled: "yes" }),
		};

		// Add user
		const result = await mikrotikService.addPPPoEUser(userData);

		return NextResponse.json({
			success: true,
			message: "PPPoE user created successfully",
			data: {
				id: result,
				...userData,
				disabled: Boolean(disabled),
			},
		});
	} catch (error) {
		console.error("Error creating PPPoE user:", error);

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
				message: "Failed to create PPPoE user",
			},
			{ status: 500 }
		);
	}
}
