// stores/mikrotik-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";

export interface Router {
	id: number;
	uuid: string;
	name: string;
	ip_address: string;
	username: string;
	password: string;
	keepalive: boolean;
	timeout: number;
	port: number;
	api_port: number;
	location?: string;
	description?: string;
	is_active: boolean;
	last_seen?: Date;
	status: "online" | "offline" | "error";
	version?: string;
	uptime?: string;
	created_at: Date;
	updated_at: Date;
}

export interface RouterFormData {
	name: string;
	ip_address: string;
	username: string;
	password: string;
	port: number;
	api_port: number;
	timeout: number;
	keepalive: boolean;
	location?: string;
	description?: string;
}

interface MikrotikState {
	// State
	routers: Router[];
	activeRouter: Router | null;
	loading: boolean;
	syncing: boolean;
	testingConnection: boolean;
	initialized: boolean; // Add initialized flag

	// Actions
	setRouters: (routers: Router[]) => void;
	setActiveRouter: (router: Router | null) => void;
	setLoading: (loading: boolean) => void;
	setSyncing: (syncing: boolean) => void;
	setTestingConnection: (testing: boolean) => void;
	setInitialized: (initialized: boolean) => void;

	// API Actions
	fetchRouters: () => Promise<void>;
	addRouter: (routerData: RouterFormData) => Promise<Router>;
	testConnection: (
		routerData: Partial<RouterFormData>
	) => Promise<{ success: boolean; data?: any; error?: string }>;
	syncRoutersData: (id: number) => Promise<void>;
	deleteRouter: (id: number) => Promise<void>;
	updateRouter: (
		id: number,
		routerData: Partial<RouterFormData>
	) => Promise<void>;

	// Utility Actions
	resetStore: () => void;
}

const initialState = {
	routers: [],
	activeRouter: null,
	loading: false,
	syncing: false,
	testingConnection: false,
	initialized: false,
};

export const useMikrotikStore = create<MikrotikState>()(
	persist(
		(set, get) => ({
			...initialState,

			// Setters
			setRouters: (routers) => set({ routers }),
			setActiveRouter: (activeRouter) => set({ activeRouter }),
			setLoading: (loading) => set({ loading }),
			setSyncing: (syncing) => set({ syncing }),
			setTestingConnection: (testingConnection) => set({ testingConnection }),
			setInitialized: (initialized) => set({ initialized }),

			// Fetch routers from API - Made stable with useCallback pattern
			fetchRouters: async () => {
				const { loading } = get();
				if (loading) return; // Prevent multiple concurrent calls

				set({ loading: true });
				try {
					const response = await fetch("/api/mikrotik");
					if (!response.ok) throw new Error("Failed to fetch routers");

					const data = await response.json();
					console.log("Routers:", data.data);

					const { activeRouter } = get();
					set({ routers: data.data, initialized: true });

					// Set active router to first one if none selected
					if (!activeRouter && data.data.length > 0) {
						set({ activeRouter: data.data[0] });
					}
				} catch (error) {
					console.error("Error fetching routers:", error);
					toast.error("Failed to fetch routers");
				} finally {
					set({ loading: false });
				}
			},

			// Add new router
			addRouter: async (routerData: RouterFormData) => {
				try {
					const response = await fetch("/api/mikrotik", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(routerData),
					});

					if (!response.ok) throw new Error("Failed to add router");

					const newRouter = await response.json();
					const { routers } = get();
					set({ routers: [...routers, newRouter] });

					toast.success("Router added successfully");
					return newRouter;
				} catch (error) {
					console.error("Error adding router:", error);
					toast.error("Failed to add router");
					throw error;
				}
			},

			// Test connection to router
			testConnection: async (routerData: Partial<RouterFormData>) => {
				set({ testingConnection: true });
				try {
					const response = await fetch("/api/mikrotik/test-connection", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							ip_address: routerData.ip_address,
							username: routerData.username,
							password: routerData.password,
							port: routerData.port || 8728,
							timeout: routerData.timeout || 30000,
						}),
					});

					const result = await response.json();

					if (response.ok && result.success) {
						toast.success("Connection successful!");
						return {
							success: true,
							data: result.data,
						};
					} else {
						toast.error(result.error || "Connection failed");
						return {
							success: false,
							error: result.error,
						};
					}
				} catch (error) {
					console.error("Error testing connection:", error);
					toast.error("Connection test failed");
					return {
						success: false,
						error: "Connection test failed",
					};
				} finally {
					set({ testingConnection: false });
				}
			},

			// Sync all routers data
			syncRoutersData: async (id: number) => {
				set({ syncing: true });
				try {
					const response = await fetch(`/api/mikrotik/${id}/sync`, {
						method: "POST",
					});

					if (!response.ok) throw new Error("Failed to sync routers");

					const result = await response.json();
					await get().fetchRouters(); // Refresh the list

					toast.success(`Synced ${result.synced} routers successfully`);
				} catch (error) {
					console.error("Error syncing routers:", error);
					toast.error("Failed to sync routers data");
				} finally {
					set({ syncing: false });
				}
			},

			// Delete router
			deleteRouter: async (id: number) => {
				try {
					const response = await fetch(`/api/mikrotik/${id}`, {
						method: "DELETE",
					});

					if (!response.ok) throw new Error("Failed to delete router");

					const { routers, activeRouter } = get();
					const updatedRouters = routers.filter((router) => router.id !== id);
					set({ routers: updatedRouters });

					// If deleted router was active, set first available as active
					if (activeRouter?.id === id) {
						set({
							activeRouter:
								updatedRouters.length > 0 ? updatedRouters[0] : null,
						});
					}

					toast.success("Router deleted successfully");
				} catch (error) {
					console.error("Error deleting router:", error);
					toast.error("Failed to delete router");
				}
			},

			// Update router
			updateRouter: async (id: number, routerData: Partial<RouterFormData>) => {
				try {
					const response = await fetch(`/api/routers/${id}`, {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(routerData),
					});

					if (!response.ok) throw new Error("Failed to update router");

					const updatedRouter = await response.json();
					const { routers, activeRouter } = get();

					const updatedRouters = routers.map((router) =>
						router.id === id ? updatedRouter : router
					);

					set({
						routers: updatedRouters,
						activeRouter:
							activeRouter?.id === id ? updatedRouter : activeRouter,
					});

					toast.success("Router updated successfully");
				} catch (error) {
					console.error("Error updating router:", error);
					toast.error("Failed to update router");
					throw error;
				}
			},

			// Reset store to initial state
			resetStore: () => set(initialState),
		}),
		{
			name: "mikrotik-store",
			storage: createJSONStorage(() => localStorage),
			// Only persist essential data, not loading states
			partialize: (state) => ({
				routers: state.routers,
				activeRouter: state.activeRouter,
			}),
		}
	)
);

// // Hook yang diperbaiki
// import { useEffect, useRef } from "react";

// // Re-export types for convenience
// export type { Router, RouterFormData } from "@/stores/mikrotik-store";

// export function useMikrotikSwitcher() {
// 	const initialized = useRef(false);

// 	const {
// 		// State
// 		routers,
// 		activeRouter,
// 		loading,
// 		syncing,
// 		testingConnection,
// 		initialized: storeInitialized,
// 		// Actions
// 		setActiveRouter,
// 		fetchRouters,
// 		addRouter,
// 		testConnection,
// 		syncRoutersData,
// 		deleteRouter,
// 		updateRouter,
// 	} = useMikrotikStore();

// 	// Initialize - fetch routers on mount (only once)
// 	useEffect(() => {
// 		if (!initialized.current && !storeInitialized) {
// 			initialized.current = true;
// 			fetchRouters();
// 		}
// 	}, [storeInitialized]); // Remove fetchRouters from dependency

// 	return {
// 		// State
// 		routers,
// 		activeRouter,
// 		loading,
// 		syncing,
// 		testingConnection,
// 		// Actions
// 		setActiveRouter,
// 		fetchRouters,
// 		addRouter,
// 		testConnection,
// 		syncRoutersData,
// 		deleteRouter,
// 		updateRouter,
// 	};
// }
