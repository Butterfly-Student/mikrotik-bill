// app/api/mikrotik/logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { type MikrotikAPI } from "@/lib/mikrotik";
import { getMikrotikService } from "@/lib/mikrotik-singeleton";


export async function GET(request: NextRequest) {
	try {
		// Get query parameters
		const searchParams = request.nextUrl.searchParams;
		const limit = parseInt(searchParams.get("limit") || "100");
		const topics = searchParams.get("topics"); // Optional filter by topics

		// Validate limit
		if (limit < 1 || limit > 1000) {
			return NextResponse.json(
				{ error: "Limit must be between 1 and 1000" },
				{ status: 400 }
			);
		}
		const mikrotikService: MikrotikAPI = await getMikrotikService();
		// Get logs from MikroTik
		const logs = await mikrotikService.getSystemLogs(limit);

		// Filter by topics if specified
		let filteredLogs = logs;
		if (topics) {
			const topicsArray = topics.split(",").map((t) => t.trim().toLowerCase());
			filteredLogs = logs.filter((log: any) => {
				if (!log.topics) return false;
				const logTopics = log.topics.toLowerCase();
				return topicsArray.some((topic) => logTopics.includes(topic));
			});
		}

		// Transform logs to ensure consistent format
		const transformedLogs = filteredLogs.map((log: any, index: number) => ({
			id: log[".id"] || log.id || `log-${Date.now()}-${index}`,
			time: log.time || new Date().toISOString(),
			topics: log.topics || "system",
			message: log.message || "No message available",
		}));

		return NextResponse.json(transformedLogs);
	} catch (error) {
		console.error("Error fetching MikroTik logs:", error);

		// Return appropriate error response
		if (error instanceof Error) {
			if (error.message.includes("connection")) {
				return NextResponse.json(
					{ error: "Failed to connect to MikroTik router" },
					{ status: 503 }
				);
			}
			if (error.message.includes("authentication")) {
				return NextResponse.json(
					{ error: "Authentication failed" },
					{ status: 401 }
				);
			}
			if (error.message.includes("timeout")) {
				return NextResponse.json({ error: "Request timeout" }, { status: 408 });
			}
		}

		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// Optional: Add POST method for advanced filtering
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { limit = 100, topics = [], dateFrom, dateTo, searchQuery } = body;

		// Validate input
		if (limit < 1 || limit > 1000) {
			return NextResponse.json(
				{ error: "Limit must be between 1 and 1000" },
				{ status: 400 }
			);
		}
		const mikrotikService: MikrotikAPI = await getMikrotikService();
		// Get logs from MikroTik
		const logs = await mikrotikService.getSystemLogs(limit);

		// Apply filters
		let filteredLogs = logs;

		// Filter by topics
		if (topics.length > 0) {
			filteredLogs = filteredLogs.filter((log: any) => {
				if (!log.topics) return false;
				const logTopics = log.topics.toLowerCase();
				return topics.some((topic: string) =>
					logTopics.includes(topic.toLowerCase())
				);
			});
		}

		// Filter by search query
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filteredLogs = filteredLogs.filter((log: any) => {
				return (
					(log.message && log.message.toLowerCase().includes(query)) ||
					(log.topics && log.topics.toLowerCase().includes(query))
				);
			});
		}

		// Filter by date range (if provided)
		if (dateFrom || dateTo) {
			filteredLogs = filteredLogs.filter((log: any) => {
				if (!log.time) return false;

				try {
					// Parse MikroTik time format
					const logDate = new Date(log.time);

					if (dateFrom && logDate < new Date(dateFrom)) return false;
					if (dateTo && logDate > new Date(dateTo)) return false;

					return true;
				} catch {
					return false;
				}
			});
		}

		// Transform logs
		const transformedLogs = filteredLogs.map((log: any, index: number) => ({
			id: log[".id"] || log.id || `log-${Date.now()}-${index}`,
			time: log.time || new Date().toISOString(),
			topics: log.topics || "system",
			message: log.message || "No message available",
		}));

		return NextResponse.json({
			logs: transformedLogs,
			total: transformedLogs.length,
			filtered: transformedLogs.length !== logs.length,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Error in POST /api/mikrotik/logs:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
