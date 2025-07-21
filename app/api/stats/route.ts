import { NextResponse } from "next/server";
import { query } from "@/lib/database";
import { getCached, setCached, CACHE_KEYS } from "@/lib/cache";

export async function GET() {
	try {
		// Try to get from cache first
		let stats = getCached(CACHE_KEYS.DASHBOARD_STATS);

		if (!stats) {
			// Fetch fresh data from database using UNION to combine hotspot_users and pppoe_users
			const [
				usersResult,
				revenueResult,
				expiringResult,
				pendingInvoicesResult,
			] = await Promise.all([
				query(`
          WITH combined_users AS (
            SELECT 
              'hotspot' as service_type,
              status,
              expires_at
            FROM hotspot_users
            UNION ALL
            SELECT 
              'pppoe' as service_type,
              status,
              expires_at
            FROM pppoe_users
          )
          SELECT 
            COUNT(*) as total_users,
            COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
            COUNT(CASE WHEN service_type = 'hotspot' THEN 1 END) as hotspot_users,
            COUNT(CASE WHEN service_type = 'pppoe' THEN 1 END) as pppoe_users
          FROM combined_users
        `),
				query(`
          SELECT 
            COALESCE(SUM(amount), 0) as total_revenue
          FROM invoices 
          WHERE status = 'paid' 
          AND created_at >= date_trunc('month', CURRENT_DATE)
        `),
				query(`
          WITH combined_users AS (
            SELECT status, expires_at FROM hotspot_users
            UNION ALL
            SELECT status, expires_at FROM pppoe_users
          )
          SELECT 
            COUNT(CASE WHEN expires_at <= CURRENT_DATE + INTERVAL '7 days' THEN 1 END) as expiring_soon
          FROM combined_users 
          WHERE status = 'active'
        `),
				query(`
          SELECT 
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_invoices
          FROM invoices
        `),
			]);

			stats = {
				totalUsers: Number.parseInt(usersResult.rows[0].total_users),
				activeUsers: Number.parseInt(usersResult.rows[0].active_users),
				hotspotUsers: Number.parseInt(usersResult.rows[0].hotspot_users),
				pppoeUsers: Number.parseInt(usersResult.rows[0].pppoe_users),
				totalRevenue: Number.parseFloat(revenueResult.rows[0].total_revenue),
				pendingInvoices: Number.parseInt(
					pendingInvoicesResult.rows[0].pending_invoices
				),
				expiringSoon: Number.parseInt(expiringResult.rows[0].expiring_soon),
				monthlyGrowth: 12.5, // Calculate this based on previous month data
			};

			// Cache for 2 minutes
			setCached(CACHE_KEYS.DASHBOARD_STATS, stats, 1000 * 60 * 2);
		}

		return NextResponse.json({
			success: true,
			data: stats,
		});
	} catch (error) {
		console.error("Error fetching dashboard stats:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch dashboard statistics" },
			{ status: 500 }
		);
	}
}
