import { VoucherBatch } from "@/types/voucher";
import PDFDocument from "pdfkit";

export async function generateVoucherPDF(batch: VoucherBatch): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		try {
			const doc = new PDFDocument({ size: "A4", margin: 20 });
			const chunks: Buffer[] = [];

			doc.on("data", (chunk) => chunks.push(chunk));
			doc.on("end", () => resolve(Buffer.concat(chunks)));

			// PDF Header
			doc.fontSize(20).text("VOUCHER WIFI", { align: "center" });
			doc.moveDown();

			// Voucher grid (4 columns)
			const pageWidth = doc.page.width - 40;
			const voucherWidth = pageWidth / 4;
			const voucherHeight = 120;
			let x = 20;
			let y = 100;

			batch.vouchers.forEach((voucher, index) => {
				if (index > 0 && index % 4 === 0) {
					y += voucherHeight + 10;
					x = 20;
				}

				if (y > doc.page.height - 150) {
					doc.addPage();
					y = 50;
					x = 20;
				}

				// Draw voucher box
				doc.rect(x, y, voucherWidth - 5, voucherHeight).stroke();

				// Voucher content
				doc.fontSize(12).text("FAUZ FATIH", x + 5, y + 10, {
					width: voucherWidth - 10,
					align: "center",
				});
				doc.fontSize(10).text(`[${index + 1}]`, x + 5, y + 25, {
					width: voucherWidth - 10,
					align: "center",
				});
				doc.fontSize(8).text("Kode Voucher", x + 5, y + 40, {
					width: voucherWidth - 10,
					align: "center",
				});
				doc.fontSize(14).text(voucher.username, x + 5, y + 55, {
					width: voucherWidth - 10,
					align: "center",
				});
				doc.fontSize(8).text("2d 2d Rp 5.000", x + 5, y + 75, {
					width: voucherWidth - 10,
					align: "center",
				});

				x += voucherWidth;
			});

			doc.end();
		} catch (error) {
			reject(error);
		}
	});
}

export function generateVoucherCSV(batch: VoucherBatch): string {
	const headers = [
		"Username",
		"Password",
		"Profile",
		"Validity",
		"Status",
		"Created",
	];
	const rows = batch.vouchers.map((voucher) => [
		voucher.username,
		voucher.password,
		voucher.profile,
		voucher.validity,
		voucher.used ? "Used" : "Unused",
		new Date(voucher.created_at).toLocaleDateString(),
	]);

	return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}
