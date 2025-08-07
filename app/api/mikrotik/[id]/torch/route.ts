// app/api/mikrotik/[id]/torch/route.ts
import { createMikrotikClient } from "@/lib/mikrotik/client";
import { NextRequest, NextResponse } from "next/server";

let cachedData: any = null;

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const client = await createMikrotikClient(Number(params.id));

		const torchData = await client.startTorch();

		return NextResponse.json({
			success: true,
			data: torchData,
		});

	} catch (err) {
		return NextResponse.json(
			{ success: false, error: err.message },
			{ status: 500 }
		);
	}
}
