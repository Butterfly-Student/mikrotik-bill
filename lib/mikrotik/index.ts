import { IRosOptions, RouterOSClient } from "routeros-client";

export class MikrotikClient {
	private client: RouterOSClient;
	private connectedApi?: Awaited<ReturnType<RouterOSClient["connect"]>>;
	private isConnected = false;

	constructor(private config: IRosOptions) {
		this.client = new RouterOSClient({
			host: config.host,
			user: config.user,
			password: config.password,
			port: config.port ?? 8728,
			keepalive: config.keepalive ?? true,
			timeout: 10000,
		});
	}

	async connect(): Promise<void> {
		if (!this.isConnected) {
			this.connectedApi = await this.client.connect();
			this.isConnected = true;
		}
	}

	async disconnect(): Promise<void> {
		if (this.isConnected) {
			await this.client.close();
			this.isConnected = false;
		}
	}

	async getSystemInfo(): Promise<any> {
		await this.connect();
		return this.connectedApi!.menu("/system/resource").getOnly();
	}

	async getIdentity(): Promise<any> {
		await this.connect();
		return this.connectedApi!.menu("/system/identity").getOnly();
	}

	// Additional method to get available interfaces
	async getInterfaces(): Promise<any[]> {
		await this.connect();
		return this.connectedApi!.menu("/interface").get();
	}
}
