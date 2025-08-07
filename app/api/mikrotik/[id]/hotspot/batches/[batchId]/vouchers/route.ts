// app/api/mikrotik/radius/hotspot/batches/[id]/vouchers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { vouchers } from "@/database/schema/mikrotik";
import { and, eq } from "drizzle-orm";

interface RouteParams {
	params: {
		id: string;
		batchId: string;
	};
}

export async function GET(request: NextRequest, { params }: RouteParams) {
	const { batchId, id } = params;

	if (!batchId) {
		return NextResponse.json(
			{
				success: false,
				message: "Invalid batch ID",
			},
			{ status: 400 }
		);
	}

	const identity = parseInt(batchId);
	const mikrotikId = parseInt(id);

	if (isNaN(identity)) {
		return NextResponse.json(
			{
				success: false,
				message: "Invalid batch ID format",
			},
			{ status: 400 }
		);
	}

	try {
		// Get all vouchers for this batch
		const batchVouchers = await db
			.select()
			.from(vouchers)
			.where(
							and(
								eq(vouchers.batch_id, identity),
								eq(vouchers.router_id, mikrotikId),
							)
						)

		// Format vouchers for frontend
		const formattedVouchers = batchVouchers.map((voucher) => ({
			id: voucher.id,
			username: (voucher.general as any)?.name || "",
			password: (voucher.general as any)?.password || "",
			profile: "Hotspot Profile", // You might want to join with session_profiles
			validity: "Unlimited", // Calculate based on limits
			used: voucher.status === "used",
			status: voucher.status,
			created_at: voucher.created_at,
			statistics: voucher.statistics,
		}));

		return NextResponse.json({
			success: true,
			data: formattedVouchers,
		});
	} catch (error) {
		console.error("Error fetching batch vouchers:", error);
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
