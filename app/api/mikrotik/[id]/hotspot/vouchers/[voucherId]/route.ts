import { db } from "@/lib/db/index";
import { MikrotikClient } from "@/lib/mikrotik/client";
import { MikrotikHotspot } from "@/lib/mikrotik/services/MikrotikHotspot";
import { NextRequest, NextResponse } from "next/server";

// app/api/mikrotik/[id]/hotspot/vouchers/[voucherId]/route.ts
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; voucherId: string } }
) {
  let hotspot: MikrotikHotspot | null = null;

  try {
    const routerId = parseInt(params.id);
    const voucherId = parseInt(params.voucherId);

    if (isNaN(routerId) || isNaN(voucherId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid router ID or voucher ID",
        },
        { status: 400 }
      );
    }

    // Verify voucher belongs to this router
    const voucher = await db.query.vouchers.findFirst({
      where: (v, { eq, and }) =>
        and(eq(v.id, voucherId), eq(v.router_id, routerId)),
    });

    if (!voucher) {
      return NextResponse.json(
        {
          success: false,
          message: "Voucher not found",
        },
        { status: 404 }
      );
    }

    // Create MikroTik client and delete voucher
    const mikrotikClient = await MikrotikClient.createFromDatabase(routerId);
    hotspot = mikrotikClient as MikrotikHotspot;

    await hotspot.deleteVoucher(voucherId);

    console.log(
      `✅ Voucher ${(voucher.general as any)?.name} deleted successfully`
    );

    return NextResponse.json({
      success: true,
      message: "Voucher deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting voucher:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    if (hotspot) {
      try {
        await hotspot.disconnect();
      } catch (disconnectError) {
        console.error("⚠️ Error disconnecting:", disconnectError);
      }
    }
  }
}
