// server.ts
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { closeSocketServer, initializeSocketServer } from "./lib/socket/server";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

console.log("🚀 Starting MikroTik Monitor Server...");

app.prepare().then(() => {
	// Create HTTP server
	const httpServer = createServer(async (req, res) => {
		try {
			const parsedUrl = parse(req.url!, true);
			await handle(req, res, parsedUrl);
		} catch (err) {
			console.error("Error occurred handling", req.url, err);
			res.statusCode = 500;
			res.end("Internal server error");
		}
	});

	// Initialize Socket.IO server with MikroTik client
	const socketServer = initializeSocketServer(httpServer);

	// Start server
	httpServer
		.once("error", (err) => {
			console.error("❌ Server error:", err);
			process.exit(1);
		})
		.listen(port, () => {
			console.log(`✅ Server ready on http://${hostname}:${port}`);
			console.log(`🔌 Socket.IO server initialized`);
			console.log(`📡 MikroTik client ready`);
		});

	// Graceful shutdown
	const gracefulShutdown = async (signal: string) => {
		console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);

		try {
			// Close socket server and MikroTik connections
			await closeSocketServer();

			// Close HTTP server
			httpServer.close(() => {
				console.log("🛑 HTTP server closed");
				process.exit(0);
			});

			// Force exit after 10 seconds
			setTimeout(() => {
				console.log("⏰ Forcing shutdown after 10 seconds");
				process.exit(1);
			}, 10000);
		} catch (error) {
			console.error("❌ Error during shutdown:", error);
			process.exit(1);
		}
	};

	// Handle process signals
	process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
	process.on("SIGINT", () => gracefulShutdown("SIGINT"));
	process.on("SIGUSR2", () => gracefulShutdown("SIGUSR2")); // nodemon restart

	// Handle uncaught exceptions
	process.on("uncaughtException", (error) => {
		console.error("❌ Uncaught Exception:", error);
		gracefulShutdown("uncaughtException");
	});

	process.on("unhandledRejection", (reason, promise) => {
		console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
		gracefulShutdown("unhandledRejection");
	});
});
