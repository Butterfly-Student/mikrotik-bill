import { getSocketServer } from "@/lib/socket/server";
console.log("💥 API route loaded");
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	try {
		const socketServer = getSocketServer();

		if (!socketServer) {
			return NextResponse.json(
				{ error: "Socket server not initialized" },
				{ status: 500 }
			);
		}

		const streamCount =
			socketServer.mikrotikClient.getActiveStreamsCount?.() ?? 0;
		const connected =
			socketServer.mikrotikClient.getConnectionStatus?.() ?? false;

		return NextResponse.json({
			success: true,
			message: "Socket.IO server is running",
			activeStreams: streamCount,
			connected,
			timestamp: new Date(),
		});
	} catch (error) {
		console.error("Error checking socket server status:", error);

		return NextResponse.json(
			{
				error: "Internal server error",
				message: error instanceof Error ? error.message : String(error),
				timestamp: new Date(),
			},
			{ status: 500 }
		);
	}
}
