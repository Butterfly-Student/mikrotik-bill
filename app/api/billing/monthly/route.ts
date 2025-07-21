import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMonthlyBills, createMonthlyBill } from "@/lib/db/billing";
import { hasPermission } from "@/lib/db/index";
import { createActivityLog } from "@/lib/db/activity";

export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const canView = await hasPermission(session.user.id, "billing.read");
		if (!canView) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const { searchParams } = new URL(request.url);
		const customer_id = searchParams.get("customer_id");
		const customer_type = searchParams.get("customer_type");
		const billing_month = searchParams.get("billing_month");
		const status = searchParams.get("status");
		const limit = Number.parseInt(searchParams.get("limit") || "50");
		const offset = Number.parseInt(searchParams.get("offset") || "0");

		const filters: any = { limit, offset };

		if (customer_id) filters.customer_id = Number.parseInt(customer_id);
		if (customer_type) filters.customer_type = customer_type;
		if (billing_month) filters.billing_month = billing_month;
		if (status) filters.status = status;

		const bills = await getMonthlyBills(filters);

		return NextResponse.json(bills);
	} catch (error) {
		console.error("Error fetching monthly bills:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const canCreate = await hasPermission(session.user.id, "billing", "create");
		if (!canCreate) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const body = await request.json();
		const {
			customer_id,
			customer_type,
			customer_name,
			profile_name,
			amount,
			billing_month,
			due_date,
			notes,
		} = body;

		if (
			!customer_id ||
			!customer_type ||
			!customer_name ||
			!profile_name ||
			!amount ||
			!billing_month ||
			!due_date
		) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		const bill = await createMonthlyBill({
			customer_id,
			customer_type,
			customer_name,
			profile_name,
			amount,
			billing_month,
			due_date: new Date(due_date),
			notes,
		});

		await createActivityLog({
			user_id: session.user.id,
			action: "create_monthly_bill",
			resource_type: "billing",
			resource_id: bill.id,
			details: { customer_name, billing_month, amount },
			ip_address:
				request.headers.get("x-forwarded-for") ||
				request.headers.get("x-real-ip") ||
				"",
			user_agent: request.headers.get("user-agent") || "",
		});

		return NextResponse.json(bill, { status: 201 });
	} catch (error) {
		console.error("Error creating monthly bill:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
