// types/voucher.ts
export interface VoucherBatch {
	id: string;
	name: string;
	description?: string;
	profile: string;
	count: number;
	prefix?: string;
	length: number;
	used_count: number;
	unused_count: number;
	charset: "alphanumeric" | "alphabetic" | "numeric";
	"limit-uptime"?: string;
	"limit-bytes-total"?: string;
	status?: "pending" | "generating" | "completed" | "failed";
	created_at: Date;
	completed_at?: Date;
	error_message?: string;
}

export interface GeneratedVoucher {
	id?: string;
	batch_id: string;
	username: string;
	password: string;
	profile: string;
	comment?: string;
	used: boolean;
	used_at?: Date;
	created_at: Date;
}

export interface CreateVoucherBatchRequest {
	name: string;
	description?: string;
	profile: string;
	count: number;
	prefix?: string;
	length?: number;
	charset?: "alphanumeric" | "alphabetic" | "numeric";
	"limit-uptime"?: string;
	"limit-bytes-total"?: string;
}

export interface GenerateVouchersRequest {
	batch_id: string;
	mikrotik_config: {
		host: string;
		username: string;
		password: string;
		port?: number;
		ssl?: boolean;
	};
}
