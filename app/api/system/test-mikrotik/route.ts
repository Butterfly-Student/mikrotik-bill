
import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserById, hasPermission } from "@/lib/db/index";
import { MikrotikAPI, type MikrotikConfig } from "@/lib/mikrotik/main";
import { getSystemConfig } from "@/lib/db/system";
import { advancedExampleUsage } from "@/lib/db/test";


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

		// const canTestMikrotik = await hasPermission(
		// 	user.id,
		// 	"test_mikrotik_connection"
		// );
		// if (!canTestMikrotik) {
		// 	return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		// }

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
		const isConnected = await mikrotik.testConnection();

		if (isConnected) {
			return NextResponse.json({
				success: true,
				message: "Mikrotik connection successful",
			});
		} else {
			return NextResponse.json(
				{
					success: false,
					message: "Failed to connect to Mikrotik",
				},
				{ status: 400 }
			);
		}
	} catch (error) {
		console.error("Error testing Mikrotik connection:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
			},
			{ status: 500 }
		);
	}
}
