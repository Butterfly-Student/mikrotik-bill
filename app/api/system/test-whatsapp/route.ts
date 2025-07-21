import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getWhatsAppConfig } from "@/lib/db/system";
import { getUserById, hasPermission } from "@/lib/db/index";

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const user = await getUserById(session.user.id);
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const canTestWhatsApp = await hasPermission(
			user.id,
			"test_whatsapp_connection"
		);
		if (!canTestWhatsApp) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const config = await getWhatsAppConfig();
		if (!config || !config.apiUrl || !config.token) {
			return NextResponse.json(
				{
					error: "WhatsApp configuration is incomplete",
				},
				{ status: 400 }
			);
		}

		if (!config.enabled) {
			return NextResponse.json(
				{
					error: "WhatsApp integration is disabled",
				},
				{ status: 400 }
			);
		}

		// Test WhatsApp API connection
		const response = await fetch(`${config.apiUrl}/status`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${config.token}`,
				"Content-Type": "application/json",
			},
		});

		if (response.ok) {
			return NextResponse.json({
				success: true,
				message: "WhatsApp connection successful",
			});
		} else {
			return NextResponse.json(
				{
					success: false,
					message: "Failed to connect to WhatsApp API",
				},
				{ status: 400 }
			);
		}
	} catch (error) {
		console.error("Error testing WhatsApp connection:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
			},
			{ status: 500 }
		);
	}
}
