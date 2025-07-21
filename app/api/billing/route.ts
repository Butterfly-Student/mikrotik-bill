import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBills, createBill, getBillingStats } from "@/lib/db/billing";
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
		const status = searchParams.get("status");
		const date_from = searchParams.get("date_from");
		const date_to = searchParams.get("date_to");
		const search = searchParams.get("search");
		const limit = Number.parseInt(searchParams.get("limit") || "50");
		const offset = Number.parseInt(searchParams.get("offset") || "0");
		const stats = searchParams.get("stats") === "true";

		if (stats) {
			const billingStats = await getBillingStats();
			return NextResponse.json(billingStats);
		}

		const filters: any = { limit, offset };

		if (customer_id) filters.customer_id = Number.parseInt(customer_id);
		if (status) filters.status = status;
		if (date_from) filters.date_from = new Date(date_from);
		if (date_to) filters.date_to = new Date(date_to);
		if (search) filters.search = search;

		const bills = await getBills(filters);

		await createActivityLog({
			user_id: session.user.id,
			action: "view_bills",
			resource_type: "billing",
			ip_address:
				request.headers.get("x-forwarded-for") ||
				request.headers.get("x-real-ip") ||
				"",
			user_agent: request.headers.get("user-agent") || "",
		});

		return NextResponse.json(bills);
	} catch (error) {
		console.error("Error fetching bills:", error);
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
			bill_date,
			due_date,
			subtotal,
			tax_amount,
			discount_amount,
			total_amount,
			notes,
			items,
		} = body;

		if (!customer_id || !bill_date || !due_date || !subtotal || !total_amount) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		const bill = await createBill({
			customer_id,
			bill_date: new Date(bill_date),
			due_date: new Date(due_date),
			subtotal,
			tax_amount,
			discount_amount,
			total_amount,
			notes,
			created_by: session.user.id,
			items: items || [],
		});

		await createActivityLog({
			user_id: session.user.id,
			action: "create_bill",
			resource_type: "billing",
			resource_id: bill.id,
			details: { bill_number: bill.bill_number, total_amount },
			ip_address:
				request.headers.get("x-forwarded-for") ||
				request.headers.get("x-real-ip") ||
				"",
			user_agent: request.headers.get("user-agent") || "",
		});

		return NextResponse.json(bill, { status: 201 });
	} catch (error) {
		console.error("Error creating bill:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
