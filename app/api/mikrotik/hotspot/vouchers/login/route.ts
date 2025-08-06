import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db/index";
import { vouchers } from "@/database/schema/mikrotik";
import { eq, and } from "drizzle-orm";

// Handle preflight OPTIONS request
export async function OPTIONS(request: NextRequest) {
	return new NextResponse(null, {
		status: 200,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "POST, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type",
		},
	});
}

export async function POST(request: NextRequest) {
	// Set CORS headers
	const corsHeaders = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
	};

	try {
		const body = await request.json();
		const {
			username,
			password,
			"link-login-only": linkLoginOnly,
			"chap-id": chapId,
			"chap-challenge": chapChallenge,
		} = body;

		// Validasi input - password dan chap bisa kosong untuk voucher
		if (!username || !linkLoginOnly) {
			return NextResponse.json(
				{ success: false, message: "Username dan link-login-only diperlukan" },
				{ status: 400, headers: corsHeaders }
			);
		}

		// Query voucher dari database
		const voucher = await db
			.select()
			.from(vouchers)
			.where(
				and(
					eq(vouchers.general, {
						name: username,
						password: password || username,
					}),
					eq(vouchers.status, "unused")
				)
			)
			.limit(1);

		if (!voucher || voucher.length === 0) {
			return NextResponse.json(
				{ success: false, message: "Voucher tidak valid atau sudah digunakan" },
				{ status: 401, headers: corsHeaders }
			);
		}

		const voucherData = voucher[0];
		const limits = voucherData.limits as any;
		const statistics = voucherData.statistics as any;

		// Validasi limit uptime jika ada
		if (
			limits?.limit_uptime &&
			statistics?.used_uptime >= limits.limit_uptime
		) {
			return NextResponse.json(
				{ success: false, message: "Batas waktu voucher sudah habis" },
				{ status: 401, headers: corsHeaders }
			);
		}

		// Validasi limit bytes total jika ada
		if (
			limits?.limit_bytes_total &&
			statistics?.used_bytes_total >= limits.limit_bytes_total
		) {
			return NextResponse.json(
				{ success: false, message: "Batas data voucher sudah habis" },
				{ status: 401, headers: corsHeaders }
			);
		}

		let finalPassword = password || username;

		// Generate MD5 hash untuk CHAP authentication jika diperlukan
		if (chapId && chapChallenge) {
			const chapIdBuffer = Buffer.from(chapId, "hex");
			const passwordBuffer = Buffer.from(finalPassword, "utf-8");
			const chapChallengeBuffer = Buffer.from(chapChallenge, "hex");
			const hash = crypto.createHash("md5");
			hash.update(
				Buffer.concat([chapIdBuffer, passwordBuffer, chapChallengeBuffer])
			);
			finalPassword = hash.digest("hex");
		}

		// Update statistics voucher
		const currentStats = statistics || {};
		const updatedStats = {
			...currentStats,
			used_count: (currentStats.used_count || 0) + 1,
			last_used: new Date().toISOString(),
		};

		await db
			.update(vouchers)
			.set({
				statistics: updatedStats,
				status: "used",
				updated_at: new Date(),
			})
			.where(eq(vouchers.id, voucherData.id));

		// Generate redirect URL ke Mikrotik
		const redirectUrl = `${linkLoginOnly}&username=${encodeURIComponent(
			username
		)}&password=${finalPassword}`;

		return NextResponse.json(
			{
				success: true,
				redirect: redirectUrl,
				voucher_info: {
					id: voucherData.id,
					limits: limits,
					statistics: updatedStats,
				},
			},
			{ headers: corsHeaders }
		);
	} catch (error) {
		console.error("Voucher login error:", error);
		return NextResponse.json(
			{ success: false, message: "Terjadi kesalahan server" },
			{ status: 500, headers: corsHeaders }
		);
	}
}
