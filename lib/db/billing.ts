import { db } from "./index";
import {
	customerBills,
	billItems,
	monthlyBills,
	payments,
	transactions,
} from "./schema/billing";
import { customers } from "./schema/system";
import { users } from "./schema/users";
import { eq, desc, and, gte, lte, ilike, or, sum, count } from "drizzle-orm";

export interface CreateBillData {
	customer_id: number;
	bill_date: Date;
	due_date: Date;
	subtotal: string;
	tax_amount?: string;
	discount_amount?: string;
	total_amount: string;
	notes?: string;
	created_by: number;
	items: {
		description: string;
		quantity: string;
		unit_price: string;
		total_price: string;
	}[];
}

export interface BillFilters {
	customer_id?: number;
	status?: string;
	date_from?: Date;
	date_to?: Date;
	search?: string;
	limit?: number;
	offset?: number;
}

export async function createBill(data: CreateBillData) {
	return await db.transaction(async (tx) => {
		// Generate bill number
		const billCount = await tx
			.select({ count: count() })
			.from(customerBills)
			.then((result) => result[0]?.count || 0);

		const billNumber = `BILL-${new Date().getFullYear()}-${String(
			Number(billCount) + 1
		).padStart(6, "0")}`;

		// Create bill
		const [bill] = await tx
			.insert(customerBills)
			.values({
				customer_id: data.customer_id,
				bill_number: billNumber,
				bill_date: data.bill_date,
				due_date: data.due_date,
				subtotal: data.subtotal,
				tax_amount: data.tax_amount || "0",
				discount_amount: data.discount_amount || "0",
				total_amount: data.total_amount,
				notes: data.notes,
				created_by: data.created_by,
			})
			.returning();

		// Create bill items
		if (data.items && data.items.length > 0) {
			await tx.insert(billItems).values(
				data.items.map((item) => ({
					bill_id: bill.id,
					...item,
				}))
			);
		}

		return bill;
	});
}

export async function getBills(filters: BillFilters = {}) {
	const {
		customer_id,
		status,
		date_from,
		date_to,
		search,
		limit = 50,
		offset = 0,
	} = filters;

	let query = db
		.select({
			id: customerBills.id,
			bill_number: customerBills.bill_number,
			bill_date: customerBills.bill_date,
			due_date: customerBills.due_date,
			subtotal: customerBills.subtotal,
			tax_amount: customerBills.tax_amount,
			discount_amount: customerBills.discount_amount,
			total_amount: customerBills.total_amount,
			paid_amount: customerBills.paid_amount,
			status: customerBills.status,
			notes: customerBills.notes,
			created_at: customerBills.created_at,
			customer: {
				id: customers.id,
				username: customers.username,
				full_name: customers.full_name,
				email: customers.email,
			},
			created_by_user: {
				id: users.id,
				username: users.username,
				full_name: users.full_name,
			},
		})
		.from(customerBills)
		.leftJoin(customers, eq(customerBills.customer_id, customers.id))
		.leftJoin(users, eq(customerBills.created_by, users.id))
		.orderBy(desc(customerBills.created_at));

	const conditions = [];

	if (customer_id) {
		conditions.push(eq(customerBills.customer_id, customer_id));
	}

	if (status) {
		conditions.push(eq(customerBills.status, status));
	}

	if (date_from) {
		conditions.push(gte(customerBills.bill_date, date_from));
	}

	if (date_to) {
		conditions.push(lte(customerBills.bill_date, date_to));
	}

	if (search) {
		conditions.push(
			or(
				ilike(customerBills.bill_number, `%${search}%`),
				ilike(customers.username, `%${search}%`),
				ilike(customers.full_name, `%${search}%`)
			)
		);
	}

	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	const bills = await query.limit(limit).offset(offset);

	return bills;
}

export async function getBillById(id: number) {
	const bill = await db.query.customerBills.findFirst({
		where: eq(customerBills.id, id),
		with: {
			customer: {
				columns: {
					id: true,
					username: true,
					full_name: true,
					email: true,
					phone: true,
					address: true,
				},
			},
			items: true,
			payments: true,
			created_by_user: {
				columns: {
					id: true,
					username: true,
					full_name: true,
				},
			},
		},
	});

	return bill;
}

export async function updateBillStatus(
	id: number,
	status: string,
	updatedBy: number
) {
	const [updated] = await db
		.update(customerBills)
		.set({
			status,
			updated_at: new Date(),
		})
		.where(eq(customerBills.id, id))
		.returning();

	return updated;
}

export async function createPayment(data: {
	bill_id: number;
	payment_date: Date;
	payment_method: string;
	amount: string;
	reference_number?: string;
	notes?: string;
	created_by: number;
}) {
	return await db.transaction(async (tx) => {
		// Create payment
		const [payment] = await tx.insert(payments).values(data).returning();

		// Update bill paid amount
		const bill = await tx.query.customerBills.findFirst({
			where: eq(customerBills.id, data.bill_id),
		});

		if (bill) {
			const newPaidAmount = (
				Number.parseFloat(bill.paid_amount || "0") +
				Number.parseFloat(data.amount)
			).toString();
			const newStatus =
				Number.parseFloat(newPaidAmount) >= Number.parseFloat(bill.total_amount)
					? "paid"
					: "partial";

			await tx
				.update(customerBills)
				.set({
					paid_amount: newPaidAmount,
					status: newStatus,
					updated_at: new Date(),
				})
				.where(eq(customerBills.id, data.bill_id));
		}

		return payment;
	});
}

// Monthly Bills
export async function createMonthlyBill(data: {
	customer_id: number;
	customer_type: string;
	customer_name: string;
	profile_name: string;
	amount: string;
	billing_month: string;
	due_date: Date;
	notes?: string;
}) {
	const [bill] = await db.insert(monthlyBills).values(data).returning();

	return bill;
}

export async function getMonthlyBills(
	filters: {
		customer_id?: number;
		customer_type?: string;
		billing_month?: string;
		status?: string;
		limit?: number;
		offset?: number;
	} = {}
) {
	const {
		customer_id,
		customer_type,
		billing_month,
		status,
		limit = 50,
		offset = 0,
	} = filters;

	let query = db
		.select()
		.from(monthlyBills)
		.orderBy(desc(monthlyBills.created_at));

	const conditions = [];

	if (customer_id) {
		conditions.push(eq(monthlyBills.customer_id, customer_id));
	}

	if (customer_type) {
		conditions.push(eq(monthlyBills.customer_type, customer_type));
	}

	if (billing_month) {
		conditions.push(eq(monthlyBills.billing_month, billing_month));
	}

	if (status) {
		conditions.push(eq(monthlyBills.status, status));
	}

	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	const bills = await query.limit(limit).offset(offset);

	return bills;
}

export async function updateMonthlyBillPayment(
	id: number,
	data: {
		paid_amount: string;
		payment_method?: string;
		notes?: string;
	}
) {
	const [updated] = await db
		.update(monthlyBills)
		.set({
			...data,
			paid_at: new Date(),
			status: "paid",
			updated_at: new Date(),
		})
		.where(eq(monthlyBills.id, id))
		.returning();

	return updated;
}

// Transactions
export async function createTransaction(data: {
	user_id: number;
	type: string;
	amount: string;
	balance_before?: string;
	balance_after?: string;
	description?: string;
	reference_id?: string;
}) {
	const [transaction] = await db.insert(transactions).values(data).returning();

	return transaction;
}

export async function getTransactions(
	filters: {
		user_id?: number;
		type?: string;
		date_from?: Date;
		date_to?: Date;
		limit?: number;
		offset?: number;
	} = {}
) {
	const { user_id, type, date_from, date_to, limit = 50, offset = 0 } = filters;

	let query = db
		.select()
		.from(transactions)
		.orderBy(desc(transactions.created_at));

	const conditions = [];

	if (user_id) {
		conditions.push(eq(transactions.user_id, user_id));
	}

	if (type) {
		conditions.push(eq(transactions.type, type));
	}

	if (date_from) {
		conditions.push(gte(transactions.created_at, date_from));
	}

	if (date_to) {
		conditions.push(lte(transactions.created_at, date_to));
	}

	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	const result = await query.limit(limit).offset(offset);

	return result;
}

export async function getBillingStats() {
	const totalBills = await db
		.select({ count: count() })
		.from(customerBills)
		.then((result) => result[0]?.count || 0);

	const totalRevenue = await db
		.select({ total: sum(customerBills.total_amount) })
		.from(customerBills)
		.where(eq(customerBills.status, "paid"))
		.then((result) => result[0]?.total || "0");

	const pendingBills = await db
		.select({ count: count() })
		.from(customerBills)
		.where(eq(customerBills.status, "pending"))
		.then((result) => result[0]?.count || 0);

	const overdueBills = await db
		.select({ count: count() })
		.from(customerBills)
		.where(
			and(
				eq(customerBills.status, "pending"),
				lte(customerBills.due_date, new Date())
			)
		)
		.then((result) => result[0]?.count || 0);

	return {
		totalBills,
		totalRevenue,
		pendingBills,
		overdueBills,
	};
}
