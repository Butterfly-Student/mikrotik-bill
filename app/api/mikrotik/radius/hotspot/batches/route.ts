// ========================================
// HOTSPOT BATCH API ROUTES
// ========================================

// app/api/hotspot/batches/route.ts
import { NextRequest, NextResponse } from "next/server";
import { HotspotBatchService } from "@/database/function/hotspot";
import { z } from "zod";

const batchSchema = z.object({
	batch_name: z.string().min(1, "Batch name is required"),
	profile_id: z.number().optional(),
	prefix: z.string().optional(),
	length: z.number().min(4).max(20).default(6),
	characters: z.string().default("ABCDEFGHJKLMNPQRSTUVWXYZ23456789"),
	password_mode: z
		.enum(["same_as_username", "random"])
		.default("same_as_username"),
	shared_users: z.number().default(1),
	disable: z.boolean().default(false),
	comment: z.string().optional(),
	total_generated: z
		.number()
		.min(1)
		.max(1000, "Maximum 1000 vouchers per batch"),
});

const batchService = new HotspotBatchService();

export async function GET() {
	try {
		const batches = await batchService.getBatches();
		return NextResponse.json({
			success: true,
			data: batches,
		});
	} catch (error) {
		console.error("Error getting batches:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch batches" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validatedData = batchSchema.parse(body);

		const { total_generated, ...batchData } = validatedData;
		const result = await batchService.createBatch(batchData, total_generated);

		return NextResponse.json(
			{
				success: true,
				data: result,
				message: `Successfully created batch with ${result.users.length} vouchers`,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Error creating batch:", error);
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ success: false, error: "Invalid data", details: error.errors },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ success: false, error: "Failed to create batch" },
			{ status: 500 }
		);
	}
}
