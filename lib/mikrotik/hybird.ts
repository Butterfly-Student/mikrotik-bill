import { RouterOSAPI } from "node-routeros";
import { IRosOptions, RouterOSClient } from "routeros-client";

export class MikrotikClient {
	private client: RouterOSClient;
	private connectedApi?: Awaited<ReturnType<RouterOSClient["connect"]>>;
	private isConnected = false;

	// RouterOSAPI untuk tugas-tugas tertentu
	private routerosApi: RouterOSAPI;
	private isRouterosApiConnected = false;

	constructor(private config: IRosOptions) {
		this.client = new RouterOSClient({
			host: config.host,
			user: config.user,
			password: config.password,
			port: config.port || 8728,
			keepalive: config.keepalive ?? true,
			timeout: 10000,
		});

		// Initialize RouterOSAPI dengan konfigurasi yang sama
		this.routerosApi = new RouterOSAPI({
			host: config.host,
			user: config.user,
			password: config.password,
			port: config.port || 8728,
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

		// Disconnect RouterOSAPI jika masih terhubung
		if (this.isRouterosApiConnected) {
			await this.routerosApi.close();
			this.isRouterosApiConnected = false;
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

	// Method untuk menghubungkan RouterOSAPI untuk tugas tertentu
	private async connectRouterosApi(): Promise<void> {
		if (!this.isRouterosApiConnected) {
			await this.routerosApi.connect();
			this.isRouterosApiConnected = true;
		}
	}

	// Method untuk menggunakan RouterOSAPI untuk tugas-tugas tertentu
	async executeWithRouterosApi(
		path: string,
		command?: string,
		params?: any
	): Promise<any> {
		await this.connectRouterosApi();

		return this.routerosApi.write(path);
	}

	// Method khusus untuk streaming data menggunakan RouterOSAPI
	async streamData(
		path: string | string,
		params: string | string[],
		callback: (data: any) => void,
		callbackErr?: (data: any) => void
	): Promise<void> {
		await this.connectRouterosApi();

		const stream = this.routerosApi
			.stream(path, params);

		if (stream) {
			stream.on("data", (data: any) => {
				callback(data);
			});
		}
		if (callbackErr) {
			stream.on("error", (data: any) => {
				callbackErr(data);
			});
		}
	}

	async writeStreamData(
		callbak: (data: any) => void
	) {
		await this.connectRouterosApi();
		const stream = this.routerosApi.writeStream("/interface/monitor-traffic", [
			"=interface=ether2",
		]);
	
		if(stream) {
			stream.on("data", (data: any) => {
				callbak(data);
			});
		}

	}

	// Method untuk operasi yang memerlukan RouterOSAPI
	async getRouterosApiInstance(): Promise<RouterOSAPI> {
		await this.connectRouterosApi();
		return this.routerosApi;
	}

	// Status koneksi untuk RouterOSAPI
}
