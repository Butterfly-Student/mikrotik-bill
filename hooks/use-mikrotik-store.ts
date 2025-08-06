// hooks/use-mikrotik-store.ts
import { useMikrotikStore } from "@/stores/mikrotik-store";

// Hook untuk mengakses state saja (tanpa actions)
export function useMikrotikState() {
	return useMikrotikStore((state) => ({
		routers: state.routers,
		activeRouter: state.activeRouter,
		loading: state.loading,
		syncing: state.syncing,
		testingConnection: state.testingConnection,
	}));
}

// Hook untuk mengakses actions saja
export function useMikrotikActions() {
	return useMikrotikStore((state) => ({
		setRouters: state.setRouters,
		setActiveRouter: state.setActiveRouter,
		setLoading: state.setLoading,
		setSyncing: state.setSyncing,
		setTestingConnection: state.setTestingConnection,
		fetchRouters: state.fetchRouters,
		addRouter: state.addRouter,
		testConnection: state.testConnection,
		syncRoutersData: state.syncRoutersData,
		deleteRouter: state.deleteRouter,
		updateRouter: state.updateRouter,
		resetStore: state.resetStore,
	}));
}

// Hook untuk mengakses router aktif saja
export function useActiveRouter() {
	return useMikrotikStore((state) => state.activeRouter);
}

// Hook untuk mengakses daftar router saja
export function useRouters() {
	return useMikrotikStore((state) => state.routers);
}

// Hook untuk mengakses loading states
export function useMikrotikLoadingStates() {
	return useMikrotikStore((state) => ({
		loading: state.loading,
		syncing: state.syncing,
		testingConnection: state.testingConnection,
	}));
}

// Hook untuk utility functions
export function useMikrotikUtils() {
	const { routers, activeRouter } = useMikrotikState();
	const { setActiveRouter } = useMikrotikActions();

	// Find router by ID
	const findRouterById = (id: number) => {
		return routers.find((router) => router.id === id) || null;
	};

	// Find router by UUID
	const findRouterByUuid = (uuid: string) => {
		return routers.find((router) => router.uuid === uuid) || null;
	};

	// Get online routers
	const getOnlineRouters = () => {
		return routers.filter((router) => router.status === "online");
	};

	// Get offline routers
	const getOfflineRouters = () => {
		return routers.filter((router) => router.status === "offline");
	};

	// Get router count by status
	const getRouterCountByStatus = () => {
		return routers.reduce((acc, router) => {
			acc[router.status] = (acc[router.status] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);
	};

	// Switch to next router
	const switchToNextRouter = () => {
		if (routers.length === 0) return;

		const currentIndex = activeRouter
			? routers.findIndex((router) => router.id === activeRouter.id)
			: -1;

		const nextIndex = (currentIndex + 1) % routers.length;
		setActiveRouter(routers[nextIndex]);
	};

	// Switch to previous router
	const switchToPreviousRouter = () => {
		if (routers.length === 0) return;

		const currentIndex = activeRouter
			? routers.findIndex((router) => router.id === activeRouter.id)
			: -1;

		const prevIndex = currentIndex <= 0 ? routers.length - 1 : currentIndex - 1;
		setActiveRouter(routers[prevIndex]);
	};

	return {
		findRouterById,
		findRouterByUuid,
		getOnlineRouters,
		getOfflineRouters,
		getRouterCountByStatus,
		switchToNextRouter,
		switchToPreviousRouter,
	};
}
