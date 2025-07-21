import { VoucherBatch } from "@/types/voucher";
import { NextRequest, NextResponse } from "next/server";

// Mock database - in production, use a real database
let mockBatches: VoucherBatch[] = [
	{
		id: 1,
		batch_name: "SAMPLE-BATCH",
		profile_name: "Voucher-1-Hari",
		quantity: 50,
		used_count: 10,
		unused_count: 40,
		created_at: new Date().toISOString(),
		vouchers: [],
	},
];

export async function GET() {
	try {
		return NextResponse.json({
			success: true,
			batches: mockBatches,
		});
	} catch (error) {
		console.error("Error fetching voucher batches:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch voucher batches" },
			{ status: 500 }
		);
	}
}
