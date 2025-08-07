import { NextRequest, NextResponse } from "next/server";
import { VoucherBatchService } from "@/lib/voucher-service";
import { VoucherExporter } from "@/lib/voucher-exporter";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { searchParams } = new URL(request.url);
		const format = searchParams.get("format") || "csv";

		if (!["csv", "json", "txt"].includes(format)) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid format. Supported formats: csv, json, txt",
				},
				{ status: 400 }
			);
		}

		// Get batch and vouchers
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

		const vouchers = await VoucherBatchService.getBatchVouchers(params.id);
		if (vouchers.length === 0) {
			return NextResponse.json(
				{
					success: false,
					error: "No vouchers found for this batch",
				},
				{ status: 404 }
			);
		}

		let content: string;
		let contentType: string;
		let filename: string;

		switch (format) {
			case "csv":
				content = await VoucherExporter.exportToCSV(vouchers);
				contentType = "text/csv";
				filename = `vouchers_${batch.name}_${params.id}.csv`;
				break;

			case "json":
				content = await VoucherExporter.exportToJSON(vouchers);
				contentType = "application/json";
				filename = `vouchers_${batch.name}_${params.id}.json`;
				break;

			case "txt":
				content = await VoucherExporter.exportToTXT(vouchers);
				contentType = "text/plain";
				filename = `vouchers_${batch.name}_${params.id}.txt`;
				break;

			default:
				throw new Error("Unsupported format");
		}

		return new NextResponse(content, {
			status: 200,
			headers: {
				"Content-Type": contentType,
				"Content-Disposition": `attachment; filename="${filename}"`,
			},
		});
	} catch (error) {
		console.error("Error exporting voucher batch:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to export voucher batch",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
