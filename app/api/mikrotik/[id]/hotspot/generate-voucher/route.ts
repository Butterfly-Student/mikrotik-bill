import { NextRequest, NextResponse } from "next/server";
import { VoucherBatchService } from "@/lib/voucher-service";
import { GenerateVouchersRequest, GeneratedVoucher } from "@/types/voucher";
import { MikrotikAPI } from "@/lib/mikrotik/main";

export async function POST(request: NextRequest) {
	try {
		const generateData: GenerateVouchersRequest = await request.json();

		if (!generateData.batch_id || !generateData.mikrotik_config) {
			return NextResponse.json(
				{
					success: false,
					error: "Missing required fields: batch_id, mikrotik_config",
				},
				{ status: 400 }
			);
		}

		// Get batch details
		const batch = await VoucherBatchService.getBatch(generateData.batch_id);
		if (!batch) {
			return NextResponse.json(
				{
					success: false,
					error: "Voucher batch not found",
				},
				{ status: 404 }
			);
		}

		if (batch.status === "completed") {
			return NextResponse.json(
				{
					success: false,
					error: "Vouchers already generated for this batch",
				},
				{ status: 400 }
			);
		}

		// Update batch status to generating
		await VoucherBatchService.updateBatch(generateData.batch_id, {
			status: "generating",
		});

		// Start generation process
		try {
			const mikrotik = new MikrotikAPI(generateData.mikrotik_config);

			const voucherData = {
				count: batch.count,
				profile: batch.profile,
				prefix: batch.prefix,
				length: batch.length,
				charset: batch.charset,
				comment: `Batch: ${batch.name}`,
				"limit-uptime": batch["limit-uptime"],
				"limit-bytes-total": batch["limit-bytes-total"],
			};

			const generatedVouchers = await mikrotik.generateVouchers(voucherData);

			// Convert to database format
			const vouchersToSave: GeneratedVoucher[] = generatedVouchers.map((v) => ({
				batch_id: generateData.batch_id,
				username: v.username,
				password: v.password,
				profile: v.profile,
				comment: v.comment,
				used: false,
				created_at: new Date(),
			}));

			// Save vouchers to database
			await VoucherBatchService.addVouchers(
				generateData.batch_id,
				vouchersToSave
			);

			// Update batch status
			await VoucherBatchService.updateBatch(generateData.batch_id, {
				status: "completed",
				completed_at: new Date(),
			});


			return NextResponse.json({
				success: true,
				data: {
					batch_id: generateData.batch_id,
					generated_count: generatedVouchers.length,
					vouchers: vouchersToSave,
				},
				message: "Vouchers generated successfully",
			});
		} catch (generationError) {
			// Update batch status to failed
			await VoucherBatchService.updateBatch(generateData.batch_id, {
				status: "failed",
				error_message:
					generationError instanceof Error
						? generationError.message
						: "Unknown error",
			});

			throw generationError;
		}
	} catch (error) {
		console.error("Error generating vouchers:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to generate vouchers",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
