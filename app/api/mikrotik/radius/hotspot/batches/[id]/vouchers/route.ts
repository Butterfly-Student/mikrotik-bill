
// app/api/hotspot/batches/[id]/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { HotspotBatchService } from "@/database/function/hotspot";

const batchService = new HotspotBatchService();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid batch ID" },
        { status: 400 }
      );
    }

    const users = await batchService.getBatchUsers(id);
    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error getting batch users:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch batch users" },
      { status: 500 }
    );
  }
}