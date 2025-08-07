// app/api/mikrotik/[id]/hotspot/batches/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { voucher_batches, session_profiles } from "@/database/schema/mikrotik";
import { eq, desc, and } from "drizzle-orm";
import { MikrotikHotspot } from "@/lib/mikrotik/services/MikrotikHotspot";
import { MikrotikClient } from "@/lib/mikrotik/client";
import { z } from "zod";

const createBulkVoucherSchema = z.object({
	batch_name: z.string().min(1, "Batch name is required"),
	profile_id: z.number().int().positive().optional(), // Optional profile
	total_generated: z
		.number()
		.int()
		.min(1)
		.max(10000, "Maximum 10,000 vouchers per batch"),
	length: z.number().int().min(4).max(20).optional().default(8),
	prefix: z.string().max(20).optional().default(""),
	suffix: z.string().max(20).optional().default(""),
	characters: z
		.string()
		.min(1)
		.optional()
		.default("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"),
	passwordMode: z
		.enum(["same_as_username", "random", "custom"])
		.optional()
		.default("same_as_username"),
	customPassword: z.string().optional(),
	generation_mode: z
		.enum(["random", "sequential"])
		.optional()
		.default("random"),
	comment: z.string().optional(),
	created_by: z.number().int().positive().optional(),
});

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const router_id = Number(params.id);

	if (isNaN(router_id)) {
		return NextResponse.json(
			{ success: false, message: "Invalid router ID" },
			{ status: 400 }
		);
	}

	try {
		// Validate router exists
		const router = await db.query.routers.findFirst({
			where: (r, { eq, and }) =>
				and(eq(r.id, router_id), eq(r.is_active, true)),
		});

		if (!router) {
			return NextResponse.json(
				{
					success: false,
					message: "Router not found or inactive",
				},
				{ status: 404 }
			);
		}

		// Get all batches with relations
		const batches = await db
			.select({
				id: voucher_batches.id,
				router_id: voucher_batches.router_id,
				profile_id: voucher_batches.profile_id,
				batch_name: voucher_batches.batch_name,
				generation_config: voucher_batches.generation_config,
				total_generated: voucher_batches.total_generated,
				comment: voucher_batches.comment,
				status: voucher_batches.status,
				is_active: voucher_batches.is_active,
				created_at: voucher_batches.created_at,
				updated_at: voucher_batches.updated_at,
				created_by: voucher_batches.created_by,
				profile_name: session_profiles.name, // from LEFT JOIN
			})
			.from(voucher_batches)
			.leftJoin(
				session_profiles,
				eq(voucher_batches.profile_id, session_profiles.id)
			)
			.where(eq(voucher_batches.router_id, router_id))
			.orderBy(desc(voucher_batches.created_at));

		return NextResponse.json({
			success: true,
			data: batches.map((batch) => ({
				...batch,
				profile: batch.profile_name
					? {
							id: batch.profile_id,
							name: batch.profile_name,
					  }
					: null,
				generation_config: batch.generation_config, // Include full config for frontend
			})),
		});
	} catch (error) {
		console.error("Error fetching batches:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Internal server error",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	let hotspot: MikrotikHotspot | null = null;

	try {
		const routerId = parseInt(params.id);

		if (isNaN(routerId)) {
			return NextResponse.json(
				{
					success: false,
					message: "Invalid router ID",
				},
				{ status: 400 }
			);
		}

		const body = await request.json();
		console.log("📝 Request body:", body);

		const validatedData = createBulkVoucherSchema.parse(body);
		console.log("✅ Validated data:", validatedData);

		// Validate router exists and is active
		const router = await db.query.routers.findFirst({
			where: (r, { eq, and }) => and(eq(r.id, routerId), eq(r.is_active, true)),
		});

		if (!router) {
			return NextResponse.json(
				{
					success: false,
					message: "Router not found or inactive",
				},
				{ status: 404 }
			);
		}

		// Validate profile exists if provided
		if (validatedData.profile_id) {
			const profile = await db.query.session_profiles.findFirst({
				where: (sp, { eq, and }) =>
					and(
						eq(sp.id, validatedData.profile_id!),
						eq(sp.router_id, routerId),
						eq(sp.type, "hotspot"),
						eq(sp.is_active, true)
					),
			});

			if (!profile) {
				return NextResponse.json(
					{
						success: false,
						message: `Profile with ID ${validatedData.profile_id} not found or inactive`,
					},
					{ status: 404 }
				);
			}
		}

		console.log(`🎫 Creating bulk vouchers for router ${routerId}...`);

		// Create MikroTik hotspot client
		const mikrotikHotspot = await MikrotikHotspot.createFromDatabase(routerId);
		// hotspot sekarang punya method milik MikrotikHotspot

		// Prepare bulk config with router_id
		const bulkConfig = {
			...validatedData,
			router_id: routerId, // Add router_id to the config
		};

		// Create bulk vouchers
		const result = await mikrotikHotspot.createBulkVouchers(bulkConfig);

		console.log(`✅ Bulk vouchers created successfully:`, {
			batch_id: result.batch.id,
			batch_name: result.batch.batch_name,
			total_created: result.vouchers?.length || 0,
			failed_count: result.failed.length,
		});

		// Return detailed response
		return NextResponse.json(
			{
				success: true,
				message: "Bulk vouchers created successfully",
				data: {
					batch: {
						id: result.batch.id,
						batch_name: result.batch.batch_name,
						total_generated: result.batch.total_generated,
						created_at: result.batch.created_at,
					},
					summary: {
						requested: validatedData.total_generated,
						created: result.vouchers?.length || 0,
						failed: result.failed.length,
					},
					failed_vouchers: result.failed.length > 0 ? result.failed : undefined,
				},
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("❌ Error creating bulk vouchers:", error);

		let statusCode = 500;
		let message = "Internal server error";

		if (error instanceof z.ZodError) {
			statusCode = 400;
			message = "Validation error";
			return NextResponse.json(
				{
					success: false,
					message,
					errors: error.errors.map((err) => ({
						field: err.path.join("."),
						message: err.message,
					})),
				},
				{ status: statusCode }
			);
		}

		if (error instanceof Error) {
			message = error.message;
			if (error.message.includes("already exists")) {
				statusCode = 409;
			} else if (error.message.includes("not found")) {
				statusCode = 404;
			} else if (error.message.includes("Failed to generate unique")) {
				statusCode = 409;
				message =
					"Unable to generate unique voucher codes. Try different generation settings.";
			} else if (error.message.includes("inactive")) {
				statusCode = 400;
			}
		}

		return NextResponse.json(
			{
				success: false,
				message,
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: statusCode }
		);
	}
}
