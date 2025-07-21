// ============================================================================
// app/api/mikrotik/hotspot/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { type MikrotikAPI } from "@/lib/mikrotik";
import { getMikrotikService } from "@/lib/mikrotik-singeleton";

// Generate random string for username/password
function generateRandomString(
	length: number,
	includeNumbers: boolean = true
): string {
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const numbers = "0123456789";
	const chars = includeNumbers ? letters + numbers : letters;
	let result = "";
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

// POST - Generate multiple Hotspot vouchers
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const {
			count = 1,
			profile = "default",
			server = "all",
			limitUptime,
			limitBytesIn,
			limitBytesOut,
			comment,
			prefix = "HSU",
			usernameLength = 6,
			passwordLength = 6,
			includeNumbers = true,
		} = body;

		// Validate count
		if (count < 1 || count > 100) {
			return NextResponse.json(
				{
					success: false,
					error: "Count must be between 1 and 100",
				},
				{ status: 400 }
			);
		}

		const mikrotikService: MikrotikAPI = await getMikrotikService();

		// Get existing users to avoid duplicates
		const existingUsers = await mikrotikService.getHotspotUsers();
		const existingNames = new Set(existingUsers.map((user: any) => user.name));

		const generatedVouchers = [];
		const errors = [];

		for (let i = 0; i < count; i++) {
			try {
				let username = "";
				let attempts = 0;

				// Generate unique username
				do {
					username = `${prefix}${generateRandomString(
						usernameLength,
						includeNumbers
					)}`;
					attempts++;
				} while (existingNames.has(username) && attempts < 10);

				if (attempts >= 10) {
					errors.push(
						`Failed to generate unique username for voucher ${i + 1}`
					);
					continue;
				}

				const password = generateRandomString(passwordLength, includeNumbers);

				// Create user data
				const userData = {
					name: username,
					password,
					profile,
					server,
					...(limitUptime && { "limit-uptime": limitUptime }),
					...(limitBytesIn && { "limit-bytes-in": limitBytesIn }),
					...(limitBytesOut && { "limit-bytes-out": limitBytesOut }),
					...(comment && { comment: `${comment} - Generated voucher` }),
				};

				// Add user
				const result = await mikrotikService.addHotspotUser(userData);

				generatedVouchers.push({
					id: result,
					username,
					password,
					profile,
					server,
					limitUptime,
					limitBytesIn,
					limitBytesOut,
					comment: userData.comment,
				});

				// Add to existing names to avoid duplicates in this batch
				existingNames.add(username);
			} catch (error) {
				console.error(`Error generating voucher ${i + 1}:`, error);
				errors.push(
					`Failed to generate voucher ${i + 1}: ${
						error instanceof Error ? error.message : "Unknown error"
					}`
				);
			}
		}

		return NextResponse.json({
			success: true,
			message: `Generated ${generatedVouchers.length} vouchers successfully`,
			data: generatedVouchers,
			errors: errors.length > 0 ? errors : undefined,
			summary: {
				requested: count,
				generated: generatedVouchers.length,
				failed: errors.length,
			},
		});
	} catch (error) {
		console.error("Error generating vouchers:", error);

		if (error instanceof Error) {
			if (error.message.includes("configuration")) {
				return NextResponse.json(
					{
						success: false,
						error: "MikroTik configuration not found or incomplete",
					},
					{ status: 400 }
				);
			}
		}

		return NextResponse.json(
			{
				success: false,
				error: "Internal server error",
				message: "Failed to generate vouchers",
			},
			{ status: 500 }
		);
	}
}
