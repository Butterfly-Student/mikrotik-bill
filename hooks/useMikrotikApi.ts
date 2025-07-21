import { useEffect, useState } from "react";

interface MikrotikStatus {
	status: string;
	mikrotik: {
		host: string;
		connected: boolean;
		identity?: any;
		system?: any;
		activeStreams?: number;
	};
	timestamp: Date;
}

interface MikrotikInterfaces {
	interfaces: any[];
	count: number;
	timestamp: Date;
}

export const useMikrotikApi = () => {
	const [status, setStatus] = useState<MikrotikStatus | null>(null);
	const [interfaces, setInterfaces] = useState<MikrotikInterfaces | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchStatus = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/mikrotik/status");

			if (!response.ok) {
				throw new Error("Failed to fetch status");
			}

			const data = await response.json();
			setStatus(data);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setLoading(false);
		}
	};

	const fetchInterfaces = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/mikrotik/interfaces");

			if (!response.ok) {
				throw new Error("Failed to fetch interfaces");
			}

			const data = await response.json();
			setInterfaces(data);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setLoading(false);
		}
	};

	const fetchSystemInfo = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/mikrotik/system");

			if (!response.ok) {
				throw new Error("Failed to fetch system info");
			}

			const data = await response.json();
			return data;
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
			return null;
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchStatus();
		fetchInterfaces();
	}, []);

	return {
		status,
		interfaces,
		loading,
		error,
		refetch: {
			status: fetchStatus,
			interfaces: fetchInterfaces,
			systemInfo: fetchSystemInfo,
		},
	};
};
