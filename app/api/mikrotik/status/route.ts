import { getSocketServer } from "@/lib/socket/server";
import { NextApiRequest, NextApiResponse } from "next";


export async function GET(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "GET") {
		return new Response(JSON.stringify({ error: "Methode not allowed" }), {
			status: 405,
			headers: { "Content-Type": "application/json" },
		});
		
	}

	try {
		const socketServer = getSocketServer();

		if (!socketServer) {
			console.log("Socket server not initialized");
			return new Response(JSON.stringify({ error: "Socket server not initialized" }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
			
		}

		const systemInfo = await socketServer.mikrotikClient.getSystemInfo();
		const identity = await socketServer.mikrotikClient.getIdentity();

		return new Response(
			JSON.stringify({
				status: "running",
			mikrotik: {
				host: "192.168.111.1", // Atau ambil dari config
				connected: socketServer.mikrotikClient.getConnectionStatus(),
				identity: identity,
				system: systemInfo,
				activeStreams: socketServer.mikrotikClient.getActiveStreamsCount(),
				timestamp: new Date(),
			},
			}),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	} catch (error) {
		console.error("Error getting MikroTik status:", error);
		res.status(500).json({
			error: "Failed to get MikroTik status",
			message: error instanceof Error ? error.message : "Unknown error",
			timestamp: new Date(),
		});
	}
}
