import { MikrotikClient } from "@/lib/mikrotik/index";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
) {
	try {
		const client = new MikrotikClient({
			host: "192.168.111.1",
			user: "admin",
			password: "r00t",
			port: 8728,
			keepalive: true,
			timeout: 100000,
		});

		// Event listeners
		client.on("connected", () => {
			console.log("Connected to router");
		});

		client.on("error", (error) => {
			console.error("Router error:", error);
		});

		// Gunakan methods - connection akan di-reuse otomatis
		const identity = await client.getIdentity();
		const interfaces = await client.runCommand("/interface");
		const systemInfo = await client.getSystemInfo();

		console.log("Identity:", identity);

	} catch (error) {
		console.error("Error getting system info:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to get system info" },
			{ status: 500 }
		);
	}
}
