import { getSocketServer } from "@/lib/socket/server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GET(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "GET") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	try {
		const socketServer = getSocketServer();

		if (!socketServer) {
			return res.status(500).json({ error: "Socket server not initialized" });
		}

		const systemInfo = await socketServer.mikrotikClient.getSystemInfo();
		const identity = await socketServer.mikrotikClient.getIdentity();

		res.status(200).json({
			system: systemInfo,
			identity: identity,
			timestamp: new Date(),
		});
	} catch (error) {
		console.error("Error getting system info:", error);
		res.status(500).json({
			error: "Failed to get system info",
			message: error instanceof Error ? error.message : "Unknown error",
			timestamp: new Date(),
		});
	}
}
