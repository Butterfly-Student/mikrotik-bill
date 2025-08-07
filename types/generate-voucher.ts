export interface Profile {
	id: number;
	profile_name: string;
	validity_days: number;
	price: number;
	sell_price: number;
	type: string;
	is_active: boolean;
}

export interface Router {
	id: number;
	name: string;
	ip_address: string;
	is_active: boolean;
}

export interface VoucherBatch {
	id: number
	router_id: number
	profile_id: number | null
	batch_name: string
	generation_config: any
	total_generated: number
	comment: string | null
	status: string
	is_active: boolean
	created_at: string
	created_by: number | null
	// Generation config properties
	length?: number
	prefix?: string | null
	characters?: string
	password_mode?: string
	// Relations
	profile?: Profile
	profile_name?: string
}

export interface Voucher {
	id: number;
	username: string;
	password: string;
	profile: string;
	validity: string;
	used: boolean;
	status: string;
	created_at: string;
}

export interface VoucherTemplate {
	id: string;
	name: string;
	description: string;
	previewImage?: string;
	columns: number;
	cardStyle: string;
}

export interface PrintOptions {
	template: VoucherTemplate;
	pageSize: "A4" | "Letter";
	orientation: "portrait" | "landscape";
	margin: string;
}
