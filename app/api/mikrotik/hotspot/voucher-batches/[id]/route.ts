import { NextRequest, NextResponse } from "next/server";
import { VoucherBatchService } from "@/lib/voucher-service";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const batch = await VoucherBatchService.getBatch(params.id);

		if (!batch) {
			return NextResponse.json(
				{
					success: false,
					error: "Voucher batch not found",
				},
				{ status: 404 }
			);
		}

		// Get vouchers for this batch
		const vouchers = await VoucherBatchService.getBatchVouchers(params.id);

		return NextResponse.json({
			success: true,
			data: {
				...batch,
				vouchers,
			},
		});
	} catch (error) {
		console.error("Error getting voucher batch:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to get voucher batch",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const deleted = await VoucherBatchService.deleteBatch(params.id);

		if (!deleted) {
			return NextResponse.json(
				{
					success: false,
					error: "Voucher batch not found",
				},
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			message: "Voucher batch deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting voucher batch:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to delete voucher batch",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
