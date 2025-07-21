// import { NextRequest, NextResponse } from "next/server";

// export async function GET(req: NextRequest) {
// 	console.log("[HOTSPOT LOGOUT] Received at:", new Date().toISOString());

// 	const senderIP = req.headers.get("x-forwarded-for") || req.ip || "unknown";

// 	return NextResponse.json({
// 		status: "success",
// 		message: "Hotspot logout event received",
// 		from: senderIP,
// 	});
// }


import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const body = await req.json();

	const user = body.user ?? "unknown";

	console.log(
		`[HOTSPOT LOGOUT] ${user} logged out at`,
		new Date().toISOString()
	);

	return NextResponse.json({
		status: "success",
		message: `User ${user} logged out`,
	});
}
