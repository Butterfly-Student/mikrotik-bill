import {
	Activity,
	BarChart3,
	Clock,
	CreditCard,
	DollarSign,
	Home,
	MessageSquare,
	Receipt,
	Router,
	Settings,
	Settings2,
	Shield,
	SquareActivity,
	StickyNote,
	UserCheck,
	Users,
	Wifi,
} from "lucide-react";

// Navigation Types
interface NavigationItem {
	title: string;
	url: string;
	icon?: any;
	isActive?: boolean;
	permission: string;
	items?: NavigationSubItem[];
}

export interface NavigationSubItem {
	title: string;
	url: string;
	permission: string;
	isActive?: boolean;
}

export interface NavigationConfig {
	title?: string; // Optional title for grouping
	items: NavigationItem[];
	permission?: string; // Optional permission for the entire group
}

// Navigation Configuration
export const navigationConfig: NavigationConfig[] = [
	// Main Dashboard (no group needed)
	{
		items: [
			{
				title: "Dashboard",
				url: "/dashboard",
				icon: Home,
				isActive: true,
				permission: "customers.read",
			},
		],
	},

	// Customer Management Group
	{
		title: "Customer Management",
		items: [
			{
				title: "Customers",
				url: "#",
				icon: UserCheck,
				permission: "customers.read",
				items: [
					{
						title: "Hotspot Users",
						url: "/dashboard/users/hotspot",
						permission: "customers.read",
					},
					{
						title: "PPPoE Users",
						url: "/dashboard/users/pppoe",
						permission: "customers.read",
					},
					{
						title: "Bulk Create",
						url: "/dashboard/users/bulk-create",
						permission: "customers.read",
					},
				],
			},
			{
				title: "Resellers",
				url: "#",
				icon: UserCheck,
				permission: "resellers.read",
				items: [
					{
						title: "Manage Resellers",
						url: "/dashboard/resellers",
						permission: "resellers.read",
					},
					{
						title: "Commissions",
						url: "/dashboard/resellers/commissions",
						permission: "resellers.read",
					},
					{
						title: "Top-up History",
						url: "/dashboard/resellers/topup",
						permission: "resellers.read",
					},
				],
			},
		],
	},

	// Network Services Group
	{
		title: "Network Services",
		items: [
			{
				title: "Vouchers",
				url: "#",
				icon: Receipt,
				permission: "vouchers.read",
				items: [
					{
						title: "All Vouchers",
						url: "/dashboard/vouchers",
						permission: "vouchers.read",
					},
					{
						title: "Voucher Orders",
						url: "/dashboard/vouchers/orders",
						permission: "vouchers.read",
					},
					{
						title: "My Vouchers",
						url: "/dashboard/vouchers/my-vouchers",
						permission: "vouchers.me.read",
					},
				],
			},
			{
				title: "Hotspot",
				url: "#",
				icon: Wifi,
				permission: "hotspot.read",
				items: [
					{
						title: "Vouchers",
						url: "/dashboard/hotspot/vouchers",
						permission: "hotspot.read",
					},
					{
						title: "Active Vouchers",
						url: "/dashboard/hotspot/active",
						permission: "hotspot.read",
					},
					{
						title: "Profiles",
						url: "/dashboard/hotspot/profiles",
						permission: "hotspot.read",
					},
					{
						title: "Generate Voucher",
						url: "/dashboard/hotspot/generate",
						permission: "hotspot.read",
					},
				],
			},
			{
				title: "PPPoE",
				url: "#",
				icon: Router,
				permission: "pppoe.read",
				items: [
					{
						title: "Users",
						url: "/dashboard/pppoe/users",
						permission: "pppoe.read",
					},
					{
						title: "Active Users",
						url: "/dashboard/pppoe/active",
						permission: "pppoe.read",
					},
					{
						title: "Profiles",
						url: "/dashboard/pppoe/profiles",
						permission: "pppoe.read",
					},
				],
			},
			// {
			// 	title: "Rate Limit",
			// 	url: "#",
			// 	icon: SquareActivity,
			// 	permission: "bandwidth.read",
			// },
		],
	},

	// Financial Management Group
	{
		title: "Financial Management",
		items: [
			{
				title: "Billing",
				url: "#",
				icon: CreditCard,
				permission: "billing.read",
				items: [
					{
						title: "Invoices",
						url: "/dashboard/billing/invoices",
						permission: "billing.read",
					},
					{
						title: "Payments",
						url: "/dashboard/billing/payments",
						permission: "billing.read",
					},
					{
						title: "Monthly Bills",
						url: "/dashboard/billing/monthly",
						permission: "billing.read",
					},
					{
						title: "Auto Billing",
						url: "/dashboard/billing/auto-billing",
						permission: "billing.edit",
					},
				],
			},
			{
				title: "Finance",
				url: "#",
				icon: Receipt,
				permission: "finance.read",
				items: [
					{
						title: "Overview",
						url: "/dashboard/financial",
						permission: "finance.read",
					},
					{
						title: "Bills",
						url: "/dashboard/finance/bills",
						permission: "finance.read",
					},
					{
						title: "Payments",
						url: "/dashboard/finance/payments",
						permission: "finance.read",
					},
					{
						title: "Accounts",
						url: "/dashboard/finance/accounts",
						permission: "finance.read",
					},
					{
						title: "Transactions",
						url: "/dashboard/finance/transactions",
						permission: "finance.read",
					},
					{
						title: "Reports",
						url: "/dashboard/finance/reports",
						permission: "finance.read",
					},
					{
						title: "Budget",
						url: "/dashboard/finance/budget",
						permission: "finance.read",
					},
				],
			},
		],
	},

	// Communication & Reports Group
	{
		title: "Communication & Reports",
		items: [
			{
				title: "WhatsApp",
				url: "/dashboard/whatsapp",
				icon: MessageSquare,
				permission: "whatsapp.read",
			},
			{
				title: "Reports",
				url: "/dashboard/reports",
				icon: BarChart3,
				permission: "reports.read",
				items: [
					{
						title: "Daily Report",
						url: "/dashboard/reports/daily",
						permission: "reports.read",
					},
					{
						title: "Monthly Report",
						url: "/dashboard/reports/monthly",
						permission: "reports.read",
					},
				],
			},
			{
				title: "Monitoring",
				url: "#",
				icon: Activity,
				permission: "monitoring.read",
				items: [
					{
						title: "System Overview",
						url: "/dashboard/monitoring",
						permission: "monitoring.read",
					},
					{
						title: "Live Logs",
						url: "/dashboard/monitoring/live-logs",
						permission: "monitoring.read",
					},
				],
			},
		],
	},

	// Tools & Utilities (no group title needed)
	{
		items: [
			{
				title: "Schedule Tasks",
				url: "/dashboard/schedule",
				icon: Clock,
				permission: "settings.read",
			},
			{
				title: "Notes",
				url: "/dashboard/notes",
				icon: StickyNote,
				permission: "settings.read",
			},
		],
	},

	// Administration Group
	{
		title: "Administration",
		items: [
			{
				title: "User Management",
				url: "/dashboard/admin",
				icon: Users,
				permission: "users.read",
				items: [
					{
						title: "Users",
						url: "/dashboard/admin/users",
						permission: "users.read",
					},
					{
						title: "Roles",
						url: "/dashboard/admin/roles",
						permission: "roles.read",
					},
					{
						title: "Permissions",
						url: "/dashboard/admin/permissions",
						permission: "permissions.read",
					},
				],
			},
			{
				title: "Settings",
				url: "/dashboard/settings",
				icon: Settings2,
				permission: "settings.read",
			},
		],
	},
];
