import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db/index";
import { routers, hotspot_users } from "@/database/schema/mikrotik";
import { eq, and } from "drizzle-orm";
import {
	MikrotikClient,
	createAndConnectRouter,
	loadRouterFromDatabase,
} from "@/lib/mikrotik-client";

// Validation schemas
const CreateHotspotUserSchema = z.object({
	routerId: z.number().int().positive(),
	name: z.string().min(1).max(50),
	password: z.string().min(1).max(255),
	profile: z.string().optional(),
	server: z.string().optional(),
	email: z.string().email().optional(),
	comment: z.string().optional(),
	disabled: z.boolean().default(false),
	limitUptime: z.string().optional(),
	limitBytesIn: z.string().optional(),
	limitBytesOut: z.string().optional(),
});

const UpdateHotspotUserSchema = CreateHotspotUserSchema.partial().extend({
	id: z.number().int().positive(),
});

const ConnectRouterSchema = z.object({
	host: z.string().ip(),
	username: z.string().min(1),
	password: z.string().min(1),
	port: z.number().int().min(1).max(65535).default(8728),
	name: z.string().optional(),
	location: z.string().optional(),
	description: z.string().optional(),
});

const RouterIdSchema = z.object({
	routerId: z.number().int().positive(),
});

// Helper function to get MikroTik client
async function getMikrotikClient(routerId: number): Promise<MikrotikClient> {
	const result = await loadRouterFromDatabase(routerId);

	if ("error" in result) {
		throw new Error(`Failed to load router: ${result.error}`);
	}

	return result.client;
}



// GET /api/hotspot/user - Get all hotspot users or sync from router
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const routerId = searchParams.get("routerId");
		const sync = searchParams.get("sync") === "true";

		if (!routerId) {
			return NextResponse.json(
				{ error: "routerId parameter is required" },
				{ status: 400 }
			);
		}

		const parsedRouterId = parseInt(routerId);
		if (isNaN(parsedRouterId)) {
			return NextResponse.json(
				{ error: "routerId must be a valid number" },
				{ status: 400 }
			);
		}

		// If sync is requested, fetch from MikroTik and sync to database
		if (sync) {
			try {
				const client = await getMikrotikClient(parsedRouterId);

				// Test connection
				const isConnected = await client.testConnection();
				if (!isConnected) {
					await client.updateStatus("offline");
					return NextResponse.json(
						{ error: "Router is not reachable" },
						{ status: 503 }
					);
				}

				await client.updateStatus("online");

				// Get API connection
				const api = await client["getApi"]();

				// Fetch hotspot users from MikroTik
				const mikrotikUsers = await api.write(
					"/ip/hotspot/user/print",
					{} as any
				);

				// Sync each user to database
				if (Array.isArray(mikrotikUsers)) {
					for (const user of mikrotikUsers) {
						await syncHotspotUserToDatabase(client, user, parsedRouterId);
					}
				}

				console.log(
					`Synced ${mikrotikUsers.length} hotspot users from router ${parsedRouterId}`
				);
			} catch (error) {
				console.error("Error syncing from MikroTik:", error);
				return NextResponse.json(
					{ error: "Failed to sync from MikroTik", details: error.message },
					{ status: 500 }
				);
			}
		}

		// Get users from database
		const users = await db
			.select()
			.from(hotspot_users)
			.where(eq(hotspot_users.router_id, parsedRouterId))
			.orderBy(hotspot_users.created_at);

		return NextResponse.json({
			success: true,
			data: users,
			total: users.length,
		});
	} catch (error) {
		console.error("Error fetching hotspot users:", error);
		return NextResponse.json(
			{ error: "Internal server error", details: error.message },
			{ status: 500 }
		);
	}
}
