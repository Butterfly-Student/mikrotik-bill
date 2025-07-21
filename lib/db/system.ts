import { db } from "./index";
import {
	systemConfig,
	type SystemConfig,
	type NewSystemConfig,
} from "./schema/system";
import { eq } from "drizzle-orm";

export async function getSystemConfig(): Promise<SystemConfig | null> {
	const [config] = await db.select().from(systemConfig).limit(1);
	return config || null;
}

export async function updateSystemConfig(
	data: Partial<NewSystemConfig>
): Promise<SystemConfig> {
	// Check if config exists
	const existing = await getSystemConfig();

	if (existing) {
		const [updated] = await db
			.update(systemConfig)
			.set({
				...data,
				updated_at: new Date(),
			})
			.where(eq(systemConfig.id, existing.id))
			.returning();

		return updated;
	} else {
		// Create new config if none exists
		const [created] = await db
			.insert(systemConfig)
			.values({
				...data,
				created_at: new Date(),
				updated_at: new Date(),
			})
			.returning();

		return created;
	}
}

export async function createSystemConfig(
	data: Omit<NewSystemConfig, "id" | "createdAt" | "updatedAt">
): Promise<SystemConfig> {
	const [config] = await db
		.insert(systemConfig)
		.values({
			...data,
			created_at: new Date(),
			updated_at: new Date(),
		})
		.returning();

	return config;
}

export async function getMikrotikConfig(): Promise<{
	host: string | null;
	username: string | null;
	password: string | null;
	port: number | null;
	ssl: boolean | null;
} | null> {
	const config = await getSystemConfig();

	if (!config) return null;

	return {
		host: config.mikrotik_host,
		username: config.mikrotik_username,
		password: config.mikrotik_password,
		port: config.mikrotik_port,
		ssl: config.mikrotik_ssl,
	};
}

export async function getWhatsAppConfig(): Promise<{
	apiUrl: string | null;
	token: string | null;
	enabled: boolean | null;
} | null> {
	const config = await getSystemConfig();

	if (!config) return null;

	return {
		apiUrl: config.whatsapp_api_url,
		token: config.whatsapp_api_token,
		enabled: config.whatsapp_enabled,
	};
}
