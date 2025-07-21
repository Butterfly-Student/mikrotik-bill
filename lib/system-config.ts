import {
	getSystemConfig as getConfig,
	updateSystemConfig as updateConfig,
	getMikrotikConfig,
	getWhatsAppConfig,
} from "@/lib/db/system";
import { MikrotikAPI, type MikrotikConfig } from "@/lib/mikrotik/main";
import type { SystemConfig } from "@/lib/db/schema/system";

export async function getSystemConfig(): Promise<SystemConfig | null> {
	return await getConfig();
}

export async function updateSystemConfig(
	data: Partial<SystemConfig>
): Promise<SystemConfig> {
	return await updateConfig(data);
}

export async function checkMikrotikConnection(): Promise<boolean> {
	try {
		const config = await getMikrotikConfig();

		if (!config || !config.host || !config.username) {
			return false;
		}

		const mikrotikConfig: MikrotikConfig = {
			host: config.host,
			username: config.username,
			password: config.password || "",
			port: config.port || 8728,
			ssl: config.ssl || false,
			timeout: 10000,
		};

		const mikrotik = new MikrotikAPI(mikrotikConfig);
		return await mikrotik.testConnection();
	} catch (error) {
		console.error("Mikrotik connection test failed:", error);
		return false;
	}
}

export async function checkWhatsAppConnection(): Promise<boolean> {
	try {
		const config = await getWhatsAppConfig();

		if (!config || !config.apiUrl || !config.token || !config.enabled) {
			return false;
		}

		const response = await fetch(`${config.apiUrl}/status`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${config.token}`,
				"Content-Type": "application/json",
			},
			signal: AbortSignal.timeout(10000),
		});

		return response.ok;
	} catch (error) {
		console.error("WhatsApp connection test failed:", error);
		return false;
	}
}
