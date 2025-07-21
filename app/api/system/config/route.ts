import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSystemConfig, updateSystemConfig } from "@/lib/db/system";
import { getUserById, hasPermission } from "@/lib/db/index";
import { SystemConfig } from "@/lib/db/schema/system";
import { checkMikrotikConnection } from "@/lib/system-config";

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

		// const canViewConfig = await hasPermission(user.id, "view_system_config");
		// if (!canViewConfig) {
		// 	return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		// }

		const config: SystemConfig | null = await getSystemConfig();


		return NextResponse.json({
			success: true,
			data: config,
			setupRequired: !config?.setup_completed,
			message: config
				? "System configuration loaded"
				: "No system configuration found",
		});
	} catch (error) {
		console.error("Error fetching system config:", error);
		return NextResponse.json(
			{
				success: false,
				data: null,
				setupRequired: true,
				error: "Database connection failed or not configured",
				message: "Please check database connection and run migrations",
			},
			{ status: 200 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		// Update system configuration
		const updatedConfig: SystemConfig = await updateSystemConfig(body);

		// Test Mikrotik connection if config provided
		let connectionStatus = false;

		if (body.mikrotik_host && body.mikrotik_username) {
			connectionStatus = await checkMikrotikConnection();
		}

		return NextResponse.json({
			success: true,
			data: updatedConfig,
			mikrotikConnected: connectionStatus,
		});
	} catch (error) {
		console.error("Error updating system config:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to update system configuration" },
			{ status: 500 }
		);
	}
}

