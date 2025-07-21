import { GeneratedVoucher } from "@/types/voucher";

export class VoucherExporter {
	static async exportToCSV(vouchers: GeneratedVoucher[]): Promise<string> {
		const headers = [
			"Username",
			"Password",
			"Profile",
			"Comment",
			"Used",
			"Created At",
		];
		const rows = vouchers.map((v) => [
			v.username,
			v.password,
			v.profile,
			v.comment || "",
			v.used ? "Yes" : "No",
			v.created_at.toISOString(),
		]);

		const csvContent = [
			headers.join(","),
			...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
		].join("\n");

		return csvContent;
	}

	static async exportToJSON(vouchers: GeneratedVoucher[]): Promise<string> {
		return JSON.stringify(vouchers, null, 2);
	}

	static async exportToTXT(vouchers: GeneratedVoucher[]): Promise<string> {
		return vouchers
			.map(
				(v) =>
					`Username: ${v.username}\nPassword: ${v.password}\nProfile: ${
						v.profile
					}\n${"-".repeat(30)}`
			)
			.join("\n");
	}
}
