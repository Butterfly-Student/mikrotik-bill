// import { NextResponse } from "next/server";

// export const dynamic = "force-dynamic"; // selalu jalankan di server

// export async function GET(req: Request) {
// 	const { searchParams } = new URL(req.url);

// 	// Ambil parameter dasar yang dikirim script MikroTik
// 	const event = searchParams.get("event"); // 'login' | 'logout'
// 	const user = searchParams.get("user"); // username hotspot
// 	const ip = searchParams.get("ip"); // IP yang diberikan DHCP
// 	const mac = searchParams.get("mac"); // MAC address
// 	const profile = searchParams.get("profile"); // nama user‑profile
//   const id = searchParams.get(".id");

// 	// Minimal validasi—pastikan parameter kunci ada
// 	// if (!event || !user || !ip || !mac) {
// 	// 	return NextResponse.json(
// 	// 		{ ok: false, error: "Missing parameters" },
// 	// 		{ status: 400 }
// 	// 	);
// 	// }

// 	// Log ke console (atau nanti ganti simpan ke DB, dsb.)
// 	console.log(
// 		`[Hotspot ${event}] user=${user} ip=${ip} mac=${mac} profile=${profile} id=${id}`
// 	);

// 	// Balas success ringan (MikroTik tak butuh isi khusus)
// 	return NextResponse.json({ ok: true });
// }


import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const body = await req.json();

	const user = body.user ?? "unknown";

	console.log(`[HOTSPOT LOGIN] ${user} logged in at`, new Date().toISOString());

	return NextResponse.json({
		status: "success",
		message: `User ${user} logged in`,
	});
}
