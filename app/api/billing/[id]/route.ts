import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBillById, updateBillStatus } from "@/lib/db/billing";
import { hasPermission } from "@/lib/db/index";
import { createActivityLog } from "@/lib/db/activity";

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const canView = await hasPermission(session.user.id, "billing.read");
		if (!canView) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const id = Number.parseInt(params.id);
		const bill = await getBillById(id);

		if (!bill) {
			return NextResponse.json({ error: "Bill not found" }, { status: 404 });
		}

		return NextResponse.json(bill);
	} catch (error) {
		console.error("Error fetching bill:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const canUpdate = await hasPermission(session.user.id, "billing", "update");
		if (!canUpdate) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const id = Number.parseInt(params.id);
		const body = await request.json();
		const { status } = body;

		if (!status) {
			return NextResponse.json(
				{ error: "Status is required" },
				{ status: 400 }
			);
		}

		const bill = await updateBillStatus(id, status, session.user.id);

		if (!bill) {
			return NextResponse.json({ error: "Bill not found" }, { status: 404 });
		}

		await createActivityLog({
			user_id: session.user.id,
			action: "update_bill_status",
			resource_type: "billing",
			resource_id: id,
			details: { status, bill_number: bill.bill_number },
			ip_address:
				request.headers.get("x-forwarded-for") ||
				request.headers.get("x-real-ip") ||
				"",
			user_agent: request.headers.get("user-agent") || "",
		});

		return NextResponse.json(bill);
	} catch (error) {
		console.error("Error updating bill:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
