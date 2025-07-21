// app/api/mikrotik/pppoe/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { type MikrotikAPI } from "@/lib/mikrotik";
import { getMikrotikService } from "@/lib/mikrotik-singeleton";

// Get MikroTik configuration from system config

// GET - Get specific PPPoE user by ID
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = params;

		if (!id) {
			return NextResponse.json(
				{
					success: false,
					error: "User ID is required",
				},
				{ status: 400 }
			);
		}

		const mikrotikService: MikrotikAPI = await getMikrotikService();

		// Get specific user
		const user = await mikrotikService.getPPPoEUserById(id);

		if (!user) {
			return NextResponse.json(
				{
					success: false,
					error: "PPPoE user not found",
				},
				{ status: 404 }
			);
		}

		const transformedUser = {
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
		};

		return NextResponse.json({
			success: true,
			data: transformedUser,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Error fetching PPPoE user:", error);

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
				message: "Failed to fetch PPPoE user",
			},
			{ status: 500 }
		);
	}
}

// PUT - Update PPPoE user
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = params;
		const body = await request.json();

		if (!id) {
			return NextResponse.json(
				{
					success: false,
					error: "User ID is required",
				},
				{ status: 400 }
			);
		}

		const {
			name,
			password,
			profile,
			service,
			localAddress,
			remoteAddress,
			comment,
			disabled,
		} = body;

		// Validate name format if provided
		if (name && !/^[a-zA-Z0-9._-]+$/.test(name)) {
			return NextResponse.json(
				{
					success: false,
					error:
						"Username can only contain letters, numbers, dots, underscores, and hyphens",
				},
				{ status: 400 }
			);
		}

		const mikrotikConfig = await getMikrotikConfig();
		const mikrotikService = new MikrotikAPI(mikrotikConfig);

		// Check if user exists
		const existingUser = await mikrotikService.getPPPoEUserById(id);
		if (!existingUser) {
			return NextResponse.json(
				{
					success: false,
					error: "PPPoE user not found",
				},
				{ status: 404 }
			);
		}

		// If name is being changed, check if new name already exists
		if (name && name !== existingUser.name) {
			const allUsers = await mikrotikService.getPPPoEUsers();
			const nameExists = allUsers.some(
				(user: any) => user.name === name && user[".id"] !== id
			);

			if (nameExists) {
				return NextResponse.json(
					{
						success: false,
						error: "User with this name already exists",
					},
					{ status: 409 }
				);
			}
		}

		// Build update data (only include provided fields)
		const updateData: any = {};
		if (name !== undefined) updateData.name = name;
		if (password !== undefined) updateData.password = password;
		if (profile !== undefined) updateData.profile = profile;
		if (service !== undefined) updateData.service = service;
		if (localAddress !== undefined) updateData["local-address"] = localAddress;
		if (remoteAddress !== undefined)
			updateData["remote-address"] = remoteAddress;
		if (comment !== undefined) updateData.comment = comment;
		if (disabled !== undefined) updateData.disabled = disabled ? "yes" : "no";

		// Update user
		await mikrotikService.updatePPPoEUser(id, updateData);

		// Get updated user data
		const updatedUser = await mikrotikService.getPPPoEUserById(id);

		const transformedUser = {
			id: updatedUser[".id"] || "",
			name: updatedUser.name || "",
			password: updatedUser.password || "",
			profile: updatedUser.profile || "default",
			service: updatedUser.service || "pppoe",
			localAddress: updatedUser["local-address"] || "",
			remoteAddress: updatedUser["remote-address"] || "",
			comment: updatedUser.comment || "",
			disabled: Boolean(updatedUser.disabled),
			lastLoggedOut: updatedUser["last-logged-out"] || null,
		};

		return NextResponse.json({
			success: true,
			message: "PPPoE user updated successfully",
			data: transformedUser,
		});
	} catch (error) {
		console.error("Error updating PPPoE user:", error);

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
				message: "Failed to update PPPoE user",
			},
			{ status: 500 }
		);
	}
}

// DELETE - Delete PPPoE user
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = params;
    
		if (!id) {
			return NextResponse.json(
				{
					success: false,
					error: "User ID is required",
				},
				{ status: 400 }
			);
		}

		const mikrotikConfig = await getMikrotikConfig();
		const mikrotikService = new MikrotikAPI(mikrotikConfig);

		// Check if user exists
		const existingUser = await mikrotikService.getPPPoEUserById(id);

		if (!existingUser) {
			return NextResponse.json(
				{
					success: false,
					error: "PPPoE user not found",
				},
				{ status: 404 }
			);
		}

		// Delete user
		await mikrotikService.deletePPPoEUser(id);

		return NextResponse.json({
			success: true,
			message: "PPPoE user deleted successfully",
			data: {
				id,
				name: existingUser.name,
			},
		});
	} catch (error) {
		console.error("Error deleting PPPoE user:", error);

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
				message: "Failed to delete PPPoE user",
			},
			{ status: 500 }
		);
	}
}
