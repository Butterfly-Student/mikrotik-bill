// app/api/mikrotik/pppoe/profiles/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { type MikrotikAPI } from "@/lib/mikrotik";
import { getMikrotikService } from "@/lib/mikrotik-singeleton";


// GET - Get specific PPPoE profile by ID
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
					error: "Profile ID is required",
				},
				{ status: 400 }
			);
		}

		const mikrotikService: MikrotikAPI = await getMikrotikService();

		// Get specific profile
		const profile = await mikrotikService.getPPPoEProfileById(id);

		if (!profile) {
			return NextResponse.json(
				{
					success: false,
					error: "PPPoE profile not found",
				},
				{ status: 404 }
			);
		}

    const transformedProfile = {
			id: profile.id || "",
			name: profile.name || "",
			localAddress: profile.localAddress || "",
			remoteAddress: profile.remoteAddress || "",
			rateLimit: profile.rateLimit || "",
			sessionTimeout: profile.sessionTimeout || "",
			idleTimeout: profile.idleTimeout || "",
			addressList: profile.addressList || "",
			bridge: profile.bridge || "",
			bridgeHorizon: profile.bridgeHorizon || "",
			dnsServer: profile.dnsServer || "",
			winsServer: profile.winsServer || "",
			onlyOne: profile.onlyOne || false,
			useEncryption: profile.useEncryption || false,
			useCompression: profile.useCompression || false,
			useVj: profile.useVj || false,
			interface: profile.interfaceList || "",
			comment: profile.comment || "",
			disabled: profile.disabled || false,
		};

		return NextResponse.json({
			success: true,
			data: transformedProfile,
		});
	} catch (error) {
		console.error("Error getting PPPoE profile:", error);

		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Failed to get PPPoE profile",
			},
			{ status: 500 }
		);
	}
}

// PUT - Update specific PPPoE profile by ID
export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { id } = params;

		if (!id) {
			return NextResponse.json(
				{
					success: false,
					error: "Profile ID is required",
				},
				{ status: 400 }
			);
		}

		const body = await request.json();
		const mikrotikConfig = await getMikrotikConfig();
		const mikrotikService = new MikrotikAPI(mikrotikConfig);

		// Validate required fields
		if (!body.name) {
			return NextResponse.json(
				{
					success: false,
					error: "Profile name is required",
				},
				{ status: 400 }
			);
		}

		// Prepare update data
		const updateData: Record<string, any> = {};

		// Map fields from request body to MikroTik API format
		if (body.name) updateData.name = body.name;
		if (body.localAddress) updateData["local-address"] = body.localAddress;
		if (body.remoteAddress) updateData["remote-address"] = body.remoteAddress;
		if (body.bridgePort) updateData["bridge-port"] = body.bridgePort;
		if (body.bridgePortPriority)
			updateData["bridge-port-priority"] = body.bridgePortPriority;
		if (body.bridgeHorizon) updateData["bridge-horizon"] = body.bridgeHorizon;
		if (body.useCompression)
			updateData["use-compression"] = body.useCompression;
		if (body.useVj) updateData["use-vj"] = body.useVj;
		if (body.useEncryption) updateData["use-encryption"] = body.useEncryption;
		if (body.onlyOne) updateData["only-one"] = body.onlyOne;
		if (body.changesTcpMss) updateData["change-tcp-mss"] = body.changesTcpMss;
		if (body.dnsServer) updateData["dns-server"] = body.dnsServer;
		if (body.winsServer) updateData["wins-server"] = body.winsServer;
		if (body.addressList) updateData["address-list"] = body.addressList;
		if (body.rateLimit) updateData["rate-limit"] = body.rateLimit;
		if (body.sessionTimeout)
			updateData["session-timeout"] = body.sessionTimeout;
		if (body.idleTimeout) updateData["idle-timeout"] = body.idleTimeout;
		if (body.keepaliveTimeout)
			updateData["keepalive-timeout"] = body.keepaliveTimeout;
		if (body.interface) updateData.interface = body.interface;
		if (body.parentQueue) updateData["parent-queue"] = body.parentQueue;
		if (body.queueType) updateData["queue-type"] = body.queueType;
		if (body.comment !== undefined) updateData.comment = body.comment;
		if (body.disabled !== undefined)
			updateData.disabled = body.disabled ? "yes" : "no";

		// Update the profile
		const updatedProfile = await mikrotikService.updatePPPoEProfile(
			id,
			updateData
		);

		return NextResponse.json({
			success: true,
			data: updatedProfile,
			message: "PPPoE profile updated successfully",
		});
	} catch (error) {
		console.error("Error updating PPPoE profile:", error);

		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Failed to update PPPoE profile",
			},
			{ status: 500 }
		);
	}
}

// DELETE - Delete specific PPPoE profile by ID
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
					error: "Profile ID is required",
				},
				{ status: 400 }
			);
		}

		const mikrotikConfig = await getMikrotikConfig();
		const mikrotikService = new MikrotikAPI(mikrotikConfig);

		// Check if profile exists before deleting
		const existingProfile = await mikrotikService.getPPPoEProfileById(id);

		if (!existingProfile) {
			return NextResponse.json(
				{
					success: false,
					error: "PPPoE profile not found",
				},
				{ status: 404 }
			);
		}

		// Delete the profile
		await mikrotikService.deletePPPoEProfile(id);

		return NextResponse.json({
			success: true,
			message: "PPPoE profile deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting PPPoE profile:", error);

		return NextResponse.json(
			{
				success: false,
				error:
					error instanceof Error
						? error.message
						: "Failed to delete PPPoE profile",
			},
			{ status: 500 }
		);
	}
}
