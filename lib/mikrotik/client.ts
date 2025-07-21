// lib/mikrotik-client.ts
import { IRosOptions, RouterOSClient } from "routeros-client";
import { RouterOSAPI } from "node-routeros";

export interface StreamData {
	type: "ip-address" | "dhcp-lease" | "torch" | "interface-traffic" | "write-data" | "write-stream" | "stream-data";
	interfaceName?: string;
	data: any;
	timestamp: Date;
}

export class MikrotikClient {
	private client: RouterOSClient;
	private connectedApi?: Awaited<ReturnType<RouterOSClient["connect"]>>;
	private isConnected = false;
	private activeStreams: Map<string, any> = new Map();

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

	// Method untuk menghubungkan RouterOSAPI untuk tugas tertentu
	private async connectRouterosApi(): Promise<void> {
		if (!this.isRouterosApiConnected) {
			await this.routerosApi.connect();
			this.isRouterosApiConnected = true;
		}
	}

	async disconnect(): Promise<void> {
		if (this.isConnected) {
			// Stop all active streams
			for (const [streamId, stream] of this.activeStreams) {
				try {
					stream.stop();
				} catch (error) {
					console.error(`Error stopping stream ${streamId}:`, error);
				}
			}
			this.activeStreams.clear();

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

	async getInterfaces(): Promise<any[]> {
		await this.connect();
		return this.connectedApi!.menu("/interface").get();
	}

	// Method untuk menggunakan RouterOSAPI untuk tugas-tugas tertentu
	async execRouterosApi(
		callback: (data: any) => void,
		errCallback: (error: any) => void,
		params: string | string[],
		...moreParams: Array<string | string[]>
	): Promise<any> {
		await this.connectRouterosApi();

		const streamId = `write-data-${Date.now().toString()}`;

		const stream = this.routerosApi.write(params, ...moreParams);
		stream
			.then((packet: any) => {
				const streamData: StreamData = {
					type: "write-data",
					data: packet,
					timestamp: new Date(),
				};
				callback(streamData);
			})
			.catch((err: any) => {
				if (err) {
					console.error("RouterOSAPI stream error:", err);
					errCallback(err);
					return;
				}
			});
		this.activeStreams.set(streamId, stream);
		return streamId;
	}

	// Method untuk menggunakan RouterOSAPI untuk tugas-tugas tertentu
	async execRouterosApiWithStream(
		callback: (data: any) => void,
		errCallback: (error: any) => void,
		params: string | string[],
		...moreParams: Array<string | string[]>
	): Promise<any> {
		await this.connectRouterosApi();

		const streamId = `write-stream-${Date.now().toString()}`;

		const stream = this.routerosApi.writeStream(params, ...moreParams);
		stream.data((err: any, packet: any) => {
			if (err) {
				console.error("RouterOSAPI stream error:", err);
				errCallback(err);
				return;
			}
			const streamData: StreamData = {
				type: "write-stream",
				data: packet,
				timestamp: new Date(),
			};
			callback(streamData);
		});
		this.activeStreams.set(streamId, stream);
		return streamId;
	}

	// Method untuk menggunakan RouterOSAPI untuk tugas-tugas tertentu dengan streaming
	async streamData(
		callback: (data: any) => void,
		errCallback?: (data: any) => void,
		params?: string | string[],
		interfaceName?: string,
		...moreParams: any[]
	): Promise<any> {
		await this.connectRouterosApi();

		const streamId = `write-stream-${Date.now().toString()}`;

		const stream = this.routerosApi.stream(
			params,
			`=interface=${interfaceName}`,
			...moreParams
		);
		stream.data((err: any, packet: any) => {
			if (err) {
				console.error("RouterOSAPI stream error:", err);
				errCallback?.(err);
				return;
			}
			const streamData: StreamData = {
				type: "stream-data",
				interfaceName,
				data: packet,
				timestamp: new Date(),
			};
			callback(streamData);
		});
		this.activeStreams.set(streamId, stream);
		return streamId;
	}

	// Stream IP Address changes
	async startIpAddressStream(
		callback: (data: StreamData) => void,
		errorCallback?: (error: any) => void
	): Promise<string> {
		await this.connect();

		const streamId = `ip-address-${Date.now()}`;

		try {
			const stream = this.connectedApi!.menu("/ip/address").stream(
				"listen",
				(err, data) => {
					if (err) {
						console.error("IP Address stream error:", err);
						errorCallback?.(err);
						return;
					}

					const streamData: StreamData = {
						type: "ip-address",
						data: data,
						timestamp: new Date(),
					};

					callback(streamData);
				}
			);

			this.activeStreams.set(streamId, stream);
			return streamId;
		} catch (error) {
			console.error("Failed to start IP address stream:", error);
			errorCallback?.(error);
			throw error;
		}
	}

	// Stream interface monitor-traffic
	// async startInterfaceTrafficStream(
	// 	interfaceName: string,
	// 	callback: (data: StreamData) => void,
	// 	errorCallback?: (error: any) => void
	// ): Promise<string> {
	// 	await this.connect();

	// 	const streamId = `interface-traffic-${interfaceName}-${Date.now()}`;

	// 	try {
	// 		const stream = this.connectedApi!.menu("/interface monitor-traffic")
	// 			.where({ interface: interfaceName })
	// 			.stream("listen", (err, data) => {
	// 				if (err) {
	// 					console.error(
	// 						`Interface traffic stream error for ${interfaceName}:`,
	// 						err
	// 					);
	// 					errorCallback?.(err);
	// 					return;
	// 				}

	// 				const streamData: StreamData = {
	// 					type: "interface-traffic",
	// 					interfaceName: interfaceName,
	// 					data: data,
	// 					timestamp: new Date(),
	// 				};

	// 				callback(streamData);
	// 			});

	// 		this.activeStreams.set(streamId, stream);
	// 		return streamId;
	// 	} catch (error) {
	// 		console.error(
	// 			`Failed to start interface traffic stream for ${interfaceName}:`,
	// 			error
	// 		);
	// 		errorCallback?.(error);
	// 		throw error;
	// 	}
	// }

	// Stream DHCP Leases changes
	async startDhcpLeasesStream(
		callback: (data: StreamData) => void,
		errorCallback?: (error: any) => void
	): Promise<string> {
		await this.connect();

		const streamId = `dhcp-lease-${Date.now()}`;

		try {
			const stream = this.connectedApi!.menu("/ip/dhcp-server/lease").stream(
				"listen",
				(err, data) => {
					if (err) {
						console.error("DHCP stream error:", err);
						errorCallback?.(err);
						return;
					}

					const streamData: StreamData = {
						type: "dhcp-lease",
						data: data,
						timestamp: new Date(),
					};

					callback(streamData);
				}
			);

			this.activeStreams.set(streamId, stream);
			return streamId;
		} catch (error) {
			console.error("Failed to start DHCP lease stream:", error);
			errorCallback?.(error);
			throw error;
		}
	}

	// Stream Torch data
	async startTorchStream(
		interfaceName: string = "ether2",
		callback: (data: StreamData) => void,
		errorCallback?: (error: any) => void
	): Promise<string> {
		console.log("📡 Starting torch stream...");

		// Force reconnection for torch streams to avoid connection state issues
		if (this.isConnected) {
			await this.disconnect();
		}

		await this.connect();
		console.log("🔌 Connected to MikroTik in startTorchStream");

		const streamId = `torch-${interfaceName}-${Date.now()}`;
		console.log("🆔 Stream ID:", streamId);

		try {
			// Create a fresh menu instance for torch
			const torchMenu = this.connectedApi!.menu("/tool torch");

			const stream = torchMenu
				.where({ interface: interfaceName })
				.stream((err: any, data: any) => {
					console.log("📥 Stream callback triggered");

					if (err) {
						console.error("Torch stream error:", err);
						errorCallback?.(err);
						return;
					}

					console.log("📦 Raw data from MikroTik:", data);

					const streamData: StreamData = {
						type: "torch",
						data: {
							...data,
							interface: interfaceName,
						},
						timestamp: new Date(),
					};

					callback(streamData);
				});

			this.activeStreams.set(streamId, stream);
			console.log("✅ Torch stream started successfully");
			return streamId;
		} catch (error) {
			console.error("Failed to start torch stream:", error);
			errorCallback?.(error);
			throw error;
		}
	}

	// Stop specific stream
	stopStream(streamId: string): boolean {
		const stream = this.activeStreams.get(streamId);
		if (stream) {
			try {
				stream.stop();
				this.activeStreams.delete(streamId);
				return true;
			} catch (error) {
				console.error(`Error stopping stream ${streamId}:`, error);
				return false;
			}
		}
		return false;
	}

	// Get active streams count
	getActiveStreamsCount(): number {
		return this.activeStreams.size;
	}

	// Get connection status
	getConnectionStatus(): boolean {
		return this.isConnected;
	}
}
