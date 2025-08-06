export interface RouterFormData {
	name: string;
	ip_address: string;
	username: string;
	password: string;
	port: number;
	api_port: number;
	timeout: number;
	keepalive: boolean;
	location?: string;
	description?: string;
}

export interface Router extends RouterFormData {
	id: number;
	uuid: string;
	status: "online" | "offline" | "error";
	last_seen?: Date | undefined;
}
