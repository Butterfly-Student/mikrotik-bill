// app/api/mikrotik/radius/hotspot/batches/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from '@/lib/db/index'
import { voucher_batches, vouchers } from "@/database/schema/mikrotik";
import { eq } from "drizzle-orm";

interface RouteParams {
	params: {
		id: string;
	};
}

export async function GET(request: NextRequest, { params }: RouteParams) {
	const { id } = params;

	if (!id) {
		return NextResponse.json(
			{
				success: false,
				message: "Invalid batch ID",
			},
			{ status: 400 }
		);
	}

	const batchId = parseInt(id);

	if (isNaN(batchId)) {
		return NextResponse.json(
			{
				success: false,
				message: "Invalid batch ID format",
			},
			{ status: 400 }
		);
	}

	try {
		// Get batch detail
		const batch = await db
			.select()
			.from(voucher_batches)
			.where(eq(voucher_batches.id, batchId))
			.limit(1);

		if (!batch[0]) {
			return NextResponse.json(
				{
					success: false,
					message: "Batch not found",
				},
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			data: {
				...batch[0],
				...JSON.parse((batch[0].generation_config as string) || "{}"),
			},
		});
	} catch (error) {
		console.error("Error in batch detail API:", error);
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

export async function PUT(request: NextRequest, { params }: RouteParams) {
	const { id } = params;

	if (!id) {
		return NextResponse.json(
			{
				success: false,
				message: "Invalid batch ID",
			},
			{ status: 400 }
		);
	}

	const batchId = parseInt(id);

	if (isNaN(batchId)) {
		return NextResponse.json(
			{
				success: false,
				message: "Invalid batch ID format",
			},
			{ status: 400 }
		);
	}

	try {
		const body = await request.json();
		const { batch_name, comment, is_active } = body;

		const updatedBatch = await db
			.update(voucher_batches)
			.set({
				batch_name,
				comment,
				is_active,
				updated_at: new Date(),
			})
			.where(eq(voucher_batches.id, batchId))
			.returning();

		if (!updatedBatch[0]) {
			return NextResponse.json(
				{
					success: false,
					message: "Batch not found",
				},
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			message: "Batch updated successfully",
			data: updatedBatch[0],
		});
	} catch (error) {
		console.error("Error updating batch:", error);
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

export async function DELETE(request: NextRequest, { params }: RouteParams) {
	const { id } = params;

	if (!id) {
		return NextResponse.json(
			{
				success: false,
				message: "Invalid batch ID",
			},
			{ status: 400 }
		);
	}

	const batchId = parseInt(id);

	if (isNaN(batchId)) {
		return NextResponse.json(
			{
				success: false,
				message: "Invalid batch ID format",
			},
			{ status: 400 }
		);
	}

	try {
		// Delete batch and all associated vouchers
		await db.delete(vouchers).where(eq(vouchers.batch_id, batchId));

		const deletedBatch = await db
			.delete(voucher_batches)
			.where(eq(voucher_batches.id, batchId))
			.returning();

		if (!deletedBatch[0]) {
			return NextResponse.json(
				{
					success: false,
					message: "Batch not found",
				},
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			message: "Batch and all vouchers deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting batch:", error);
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
