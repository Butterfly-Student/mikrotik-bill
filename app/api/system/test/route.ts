
// app/api/mikrotik/status/route.ts
import { advancedExampleUsage } from "@/lib/db/test";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await advancedExampleUsage();
		console.log(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to get MikroTik status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
