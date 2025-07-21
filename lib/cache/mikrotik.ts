import { MikrotikClient } from '../mikrotik/client';
import { db } from '@/lib/db/index';
// lib/mikrotik/clients.ts


const clientCache = new Map<number, MikrotikClient>();

export async function createMikrotikClient(
	routerId: number
): Promise<MikrotikClient> {
	if (clientCache.has(routerId)) {
		return clientCache.get(routerId)!;
	}

	// Ambil config dari database atau di mana pun kamu simpan
	const router = await db.query.routers.findFirst({
		where: (r, { eq }) => eq(r.id, routerId),
	});

	if (!router) {
		throw new Error("Router not found");
	}
  console.log(router)

	const client = new MikrotikClient({
		host: router.ip_address,
		user: router.username,
		password: router.password,
		port: router.port || 8728,
		keepalive: true,
	});

	await client.connect();
	clientCache.set(routerId, client);

	return client;
}
