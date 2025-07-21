// app/api/hotspot/batches/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { HotspotBatchService } from "@/database/function/hotspot";
import { z } from "zod";

const batchUpdateSchema = z.object({
	batch_name: z.string().min(1).optional(),
	comment: z.string().optional(),
});

const batchService = new HotspotBatchService();

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			return NextResponse.json(
				{ success: false, error: "Invalid batch ID" },
				{ status: 400 }
			);
		}

		const batch = await batchService.getBatchById(id);
		if (!batch) {
			return NextResponse.json(
				{ success: false, error: "Batch not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			data: batch,
		});
	} catch (error) {
		console.error("Error getting batch:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch batch" },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			return NextResponse.json(
				{ success: false, error: "Invalid batch ID" },
				{ status: 400 }
			);
		}

		const body = await request.json();
		const validatedData = batchUpdateSchema.parse(body);

		const batch = await batchService.updateBatch(id, validatedData);
		return NextResponse.json({
			success: true,
			data: batch,
		});
	} catch (error) {
		console.error("Error updating batch:", error);
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ success: false, error: "Invalid data", details: error.errors },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ success: false, error: "Failed to update batch" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = parseInt(params.id);
		if (isNaN(id)) {
			return NextResponse.json(
				{ success: false, error: "Invalid batch ID" },
				{ status: 400 }
			);
		}

		const { searchParams } = new URL(request.url);
		const deleteUsers = searchParams.get("deleteUsers") === "true";

		await batchService.deleteBatch(id, deleteUsers);
		return NextResponse.json({
			success: true,
			message: "Batch deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting batch:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to delete batch" },
			{ status: 500 }
		);
	}
}

