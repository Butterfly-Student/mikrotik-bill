// hooks/useMikrotikSocket.ts
import { useState, useEffect, useCallback, useRef } from "react";
import io, { Socket } from "socket.io-client";

interface ConnectionStatus {
	status: "connected" | "disconnected" | "connecting" | "error";
	message: string;
	timestamp: Date;
	clientId?: string;
	serverInfo?: {
		mikrotikHost: string;
		totalClients: number;
	};
}

interface StreamData {
	type: "ip-address" | "dhcp-lease" | "torch" | "interface-traffic";
	streamId: string;
	data: any;
	timestamp: Date;
	interfaceName?: string; // Added for interface-specific streams
}

interface ErrorData {
	type: string;
	message: string;
	error: string;
	timestamp: Date;
	streamId?: string;
	interfaceName?: string; // Added for interface-specific errors
}

interface ServerStats {
	totalClients: number;
	totalStreams: number;
	uptime: number;
	timestamp: Date;
}

export function useMikrotikSocket(url: string = "") {
	const [socket, setSocket] = useState<typeof Socket | null>(null);
	const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
		status: "disconnected",
		message: "Not connected",
		timestamp: new Date(),
	});
	const [clientCount, setClientCount] = useState<number>(0);
	const [serverStats, setServerStats] = useState<ServerStats | null>(null);
	const [error, setError] = useState<ErrorData | null>(null);

	// Data states
	const [ipAddressData, setIpAddressData] = useState<any[]>([]);
	const [dhcpLeaseData, setDhcpLeaseData] = useState<any[]>([]);
	const [torchData, setTorchData] = useState<any[]>([]);
	const [interfaceTrafficData, setInterfaceTrafficData] = useState<any[]>([]); // Added

	// Stream states
	const [activeStreams, setActiveStreams] = useState<Set<string>>(new Set());
	const [streamStatus, setStreamStatus] = useState<Map<string, string>>(
		new Map()
	);

	const reconnectAttempts = useRef(0);
	const maxReconnectAttempts = 5;

	// Initialize socket connection
	useEffect(() => {
		const socketInstance = io(url, {
			autoConnect: true,
			timeout: 10000,
			reconnectionAttempts: 3,
		});

		setSocket(socketInstance);

		// Connection events
		socketInstance.on("connect", () => {
			console.log("✅ Connected to MikroTik Monitor");
			setConnectionStatus((prev) => ({
				...prev,
				status: "connected",
				message: "Connected to MikroTik Monitor",
				timestamp: new Date(),
			}));
			reconnectAttempts.current = 0;
		});

		socketInstance.on("disconnect", (reason: string) => {
			console.log("🔌 Disconnected from MikroTik Monitor:", reason);
			setConnectionStatus((prev) => ({
				...prev,
				status: "disconnected",
				message: `Disconnected: ${reason}`,
				timestamp: new Date(),
			}));
			setActiveStreams(new Set());
			setStreamStatus(new Map());
		});

		socketInstance.on("connect_error", (error: Error) => {
			console.error("❌ Connection error:", error);
			setConnectionStatus((prev) => ({
				...prev,
				status: "error",
				message: `Connection error: ${error.message}`,
				timestamp: new Date(),
			}));
		});

		// Server response events
		socketInstance.on("connection-status", (data: ConnectionStatus) => {
			console.log("📡 Connection status:", data);
			setConnectionStatus(data);
		});

		socketInstance.on("client-count", (data: { count: number }) => {
			setClientCount(data.count);
		});

		socketInstance.on("server-stats", (data: ServerStats) => {
			setServerStats(data);
		});

		// Stream events
		socketInstance.on("stream-started", (data: StreamData) => {
			console.log("🚀 Stream started:", data);
			setActiveStreams((prev) => new Set(prev).add(data.streamId));
			setStreamStatus((prev) => new Map(prev).set(data.streamId, "active"));
		});

		socketInstance.on(
			"stream-stopped",
			(data: { streamId: string; timestamp: Date }) => {
				console.log("🛑 Stream stopped:", data);
				setActiveStreams((prev) => {
					const newSet = new Set(prev);
					newSet.delete(data.streamId);
					return newSet;
				});
				setStreamStatus((prev) => {
					const newMap = new Map(prev);
					newMap.delete(data.streamId);
					return newMap;
				});
			}
		);

		// Data events
		socketInstance.on("ip-address-update", (data: any) => {
			setIpAddressData((prev) => {
				const newData = Array.isArray(data) ? data : [data];
				return [...prev, ...newData].slice(-100); // Keep last 100 entries
			});
		});

		socketInstance.on("dhcp-lease-update", (data: any) => {
			setDhcpLeaseData((prev) => {
				const newData = Array.isArray(data) ? data : [data];
				return [...prev, ...newData].slice(-100);
			});
		});

		socketInstance.on("torch-update", (data: any) => {
			setTorchData((prev) => {
				const newData = Array.isArray(data) ? data : [data];
				return [...prev, ...newData].slice(-100);
			});
		});

		// Interface traffic events - NEW
		socketInstance.on("interface-traffic-update", (data: any) => {
			setInterfaceTrafficData((prev) => {
				const newData = Array.isArray(data) ? data : [data];
				return [...prev, ...newData].slice(-100);
			});
		});

		// Broadcast events (from other clients)
		socketInstance.on("ip-address-broadcast", (data: any) => {
			// Handle broadcast data if needed
			console.log("📢 IP address broadcast:", data);
		});

		socketInstance.on("dhcp-lease-broadcast", (data: any) => {
			console.log("📢 DHCP lease broadcast:", data);
		});

		socketInstance.on("torch-broadcast", (data: any) => {
			console.log("📢 Torch broadcast:", data);
		});

		// Interface traffic broadcast - NEW
		socketInstance.on("interface-traffic-broadcast", (data: any) => {
			console.log("📢 Interface traffic broadcast:", data);
		});

		// Error events
		socketInstance.on("error", (data: ErrorData) => {
			console.error("❌ Socket error:", data);
			setError(data);
		});

		// Server shutdown event
		socketInstance.on(
			"server-shutdown",
			(data: { message: string; timestamp: Date }) => {
				console.log("🛑 Server shutdown:", data);
				setConnectionStatus((prev) => ({
					...prev,
					status: "disconnected",
					message: data.message,
					timestamp: data.timestamp,
				}));
			}
		);

		// Ping/pong for keepalive
		socketInstance.on("pong", (data: { timestamp: Date }) => {
			console.log("🏓 Pong received:", data);
		});

		// Cleanup on unmount
		return () => {
			socketInstance.disconnect();
		};
	}, [url]);

	// Helper functions
	const startIpStream = useCallback(() => {
		if (socket?.connected) {
			console.log("🚀 Starting IP address stream");
			socket.emit("start-ip-stream");
		}
	}, [socket]);

	const startDhcpStream = useCallback(() => {
		if (socket?.connected) {
			console.log("🚀 Starting DHCP lease stream");
			socket.emit("start-dhcp-stream");
		}
	}, [socket]);

	// Updated startInterfaceTrafficStream function
	const startInterfaceTrafficStream = useCallback(
		(interfaceName: string = "ether2") => {
			if (socket?.connected) {
				console.log(
					"🚀 Starting interface traffic stream for interface:",
					interfaceName
				);
				socket.emit("start-interface-traffic-stream", { interfaceName });
			}
		},
		[socket]
	);

	const startTorchStream = useCallback(
		(interfaceName: string = "ether2") => {
			if (socket?.connected) {
				console.log("🚀 Starting torch stream for interface:", interfaceName);
				socket.emit("start-torch-stream", { interface: interfaceName });
			}
		},
		[socket]
	);

	const stopStream = useCallback(
		(streamId: string) => {
			if (socket?.connected) {
				console.log("🛑 Stopping stream:", streamId);
				socket.emit("stop-stream", { streamId });
			}
		},
		[socket]
	);

	const getClientInfo = useCallback(() => {
		if (socket?.connected) {
			socket.emit("get-client-info");
		}
	}, [socket]);

	const getServerStats = useCallback(() => {
		if (socket?.connected) {
			socket.emit("get-server-stats");
		}
	}, [socket]);

	const ping = useCallback(() => {
		if (socket?.connected) {
			socket.emit("ping");
		}
	}, [socket]);

	const clearData = useCallback(() => {
		setIpAddressData([]);
		setDhcpLeaseData([]);
		setTorchData([]);
		setInterfaceTrafficData([]); // Added
	}, []);

	const clearError = useCallback(() => {
		setError(null);
	}, []);

	return {
		// Connection state
		socket,
		connectionStatus,
		clientCount,
		serverStats,
		error,

		// Data
		ipAddressData,
		dhcpLeaseData,
		torchData,
		interfaceTrafficData, // Added

		// Stream management
		activeStreams,
		streamStatus,

		// Actions
		startIpStream,
		startDhcpStream,
		startInterfaceTrafficStream,
		startTorchStream,
		stopStream,
		getClientInfo,
		getServerStats,
		ping,
		clearData,
		clearError,


		// Computed values
		isConnected: connectionStatus.status === "connected",
		isConnecting: connectionStatus.status === "connecting",
		hasError: connectionStatus.status === "error" || error !== null,
		streamCount: activeStreams.size,
	};
}
