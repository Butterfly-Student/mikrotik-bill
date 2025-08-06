// hooks/use-mikrotik-switcher.ts - Versi yang disederhanakan
import { useCallback } from "react";
import { Router, RouterFormData, useMikrotikStore } from "@/stores/mikrotik-store";

// Re-export types for convenience
export type { Router, RouterFormData } from "@/stores/mikrotik-store";

export function useMikrotikSwitcher() {
	const store = useMikrotikStore();

	// Stable callbacks to prevent re-renders
	const setActiveRouter = useCallback(
		(router: Router | null) => {
			store.setActiveRouter(router);
		},
		[store.setActiveRouter]
	);

	const fetchRouters = useCallback(async () => {
		await store.fetchRouters();
	}, [store.fetchRouters]);

	const addRouter = useCallback(
		async (routerData: RouterFormData) => {
			return await store.addRouter(routerData);
		},
		[store.addRouter]
	);

	const testConnection = useCallback(
		async (routerData: Partial<RouterFormData>) => {
			return await store.testConnection(routerData);
		},
		[store.testConnection]
	);

	const syncRoutersData = useCallback(async (id: number) => {
		await store.syncRoutersData(id);
	}, [store.syncRoutersData]);

	const deleteRouter = useCallback(
		async (id: number) => {
			await store.deleteRouter(id);
		},
		[store.deleteRouter]
	);

	const updateRouter = useCallback(
		async (id: number, routerData: Partial<RouterFormData>) => {
			await store.updateRouter(id, routerData);
		},
		[store.updateRouter]
	);

	return {
		// State
		routers: store.routers,
		activeRouter: store.activeRouter,
		loading: store.loading,
		syncing: store.syncing,
		testingConnection: store.testingConnection,

		// Stable actions
		setActiveRouter,
		fetchRouters,
		addRouter,
		testConnection,
		syncRoutersData,
		deleteRouter,
		updateRouter,
	};
}

// Component untuk inisialisasi store - gunakan di root component atau layout
import { useEffect } from "react";

export function MikrotikStoreInitializer() {
	const { fetchRouters, initialized } = useMikrotikStore();

	useEffect(() => {
		if (!initialized) {
			fetchRouters();
		}
	}, [fetchRouters, initialized]);

	return null; // This component doesn't render anything
}
