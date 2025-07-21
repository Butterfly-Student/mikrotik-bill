import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDashboardStats } from "@/lib/db/dashboard";
import { getMikrotikConfig, getWhatsAppConfig } from "@/lib/db/system";
import { getUserById, hasPermission } from "@/lib/db/index";
import { MikrotikAPI, type MikrotikConfig } from "@/lib/mikrotik/main";

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const user = await getUserById(session.user.id);
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const canViewDashboard = await hasPermission(user.id, "view_dashboard");
		if (!canViewDashboard) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const stats = await getDashboardStats();

		// Check Mikrotik connection status
		try {
			const mikrotikConfig = await getMikrotikConfig();
			if (mikrotikConfig && mikrotikConfig.host && mikrotikConfig.username) {
				const config: MikrotikConfig = {
					host: mikrotikConfig.host,
					username: mikrotikConfig.username,
					password: mikrotikConfig.password || "",
					port: mikrotikConfig.port || 8728,
					ssl: mikrotikConfig.ssl || false,
					timeout: 5000,
				};
				const mikrotik = new MikrotikAPI(config);
				stats.systemStatus.mikrotikConnected = await mikrotik.testConnection();
			}
		} catch (error) {
			console.error("Error checking Mikrotik status:", error);
			stats.systemStatus.mikrotikConnected = false;
		}

		// Check WhatsApp connection status
		try {
			const whatsappConfig = await getWhatsAppConfig();
			if (
				whatsappConfig &&
				whatsappConfig.apiUrl &&
				whatsappConfig.token &&
				whatsappConfig.enabled
			) {
				const response = await fetch(`${whatsappConfig.apiUrl}/status`, {
					method: "GET",
					headers: {
						Authorization: `Bearer ${whatsappConfig.token}`,
						"Content-Type": "application/json",
					},
					signal: AbortSignal.timeout(5000),
				});
				stats.systemStatus.whatsappConnected = response.ok;
			}
		} catch (error) {
			console.error("Error checking WhatsApp status:", error);
			stats.systemStatus.whatsappConnected = false;
		}

		return NextResponse.json({ stats });
	} catch (error) {
		console.error("Error fetching dashboard stats:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
