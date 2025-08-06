"use client"
import * as React from "react"
import { ChevronsUpDown, RefreshCcw, Loader2, Router, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useMikrotikSwitcher } from "@/hooks/use-mikrotik-switcher"
import { AddRouterDialog } from "./mikrotik-switcher/add-router-dialog"
import { RouterItem } from "./mikrotik-switcher/router-item"
import { DeleteRouterDialog } from "./mikrotik-switcher/delete-router-dialog"
import { getStatusIcon, getStatusBadge } from "./mikrotik-switcher/router-status"

export function MikrotikSwitcher() {
  const { isMobile } = useSidebar()

  // Local state untuk dialog - terpisah dari store
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [routerToDelete, setRouterToDelete] = React.useState<number | null>(null)

  const {
    routers,
    fetchRouters,
    activeRouter,
    setActiveRouter,
    loading,
    syncing,
    addRouter,
    syncRoutersData,
    deleteRouter,
  } = useMikrotikSwitcher()

  // Fetch routers saat komponen mount
  React.useEffect(() => {
    const fetchData = async () => {
      await fetchRouters()
    }
    fetchData()
  }, [fetchRouters])

  // Handler untuk delete - menggunakan useCallback untuk stabilitas
  const handleDeleteRouter = React.useCallback(async () => {
    if (routerToDelete) {
      await deleteRouter(routerToDelete)
      setDeleteDialogOpen(false)
      setRouterToDelete(null)
    }
  }, [routerToDelete, deleteRouter])

  // Handler untuk open delete dialog
  const handleOpenDeleteDialog = React.useCallback((routerId: number) => {
    setRouterToDelete(routerId)
    setDeleteDialogOpen(true)
  }, [])

  // Handler untuk close delete dialog
  const handleCloseDeleteDialog = React.useCallback(() => {
    setDeleteDialogOpen(false)
    setRouterToDelete(null)
  }, [])
  console.log("activeRouter", activeRouter)
  // Memoize add router handler
  const handleAddRouter = React.useCallback(async (routerData: any) => {
    return await addRouter(routerData)
  }, [addRouter])

  // Memoize sync handler
  const handleSyncRouters = React.useCallback(async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault()
    await syncRoutersData(activeRouter?.id || 0)
  }, [syncRoutersData])

  if (loading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="animate-pulse">
            <div className="bg-muted flex aspect-square size-8 items-center justify-center rounded-lg">
              <Loader2 className="size-4 animate-spin" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-3 bg-muted rounded w-16 mt-1"></div>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (!activeRouter && routers.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <AddRouterDialog onAdd={handleAddRouter} trigger="button">
            <SidebarMenuButton size="lg" className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer">
              <div className="bg-muted flex aspect-square size-8 items-center justify-center rounded-lg">
                <Plus className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="font-medium">No Routers</span>
                <span className="text-xs text-muted-foreground">Click to add a router</span>
              </div>
            </SidebarMenuButton>
          </AddRouterDialog>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg relative">
                  <Router className="size-4" />
                  {activeRouter && (
                    <div className="absolute -bottom-1 -right-1">
                      {getStatusIcon(activeRouter.status)}
                    </div>
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {activeRouter?.name || 'Select Router'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="truncate text-xs">
                      {activeRouter?.ip_address || 'No router selected'}
                    </span>
                    {activeRouter && getStatusBadge(activeRouter.status)}
                  </div>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-80 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                MikroTik Routers
              </DropdownMenuLabel>

              {routers.map((router, index) => (
                <RouterItem
                  key={router.uuid}
                  router={router}
                  index={index}
                  onClick={() => setActiveRouter(router)}
                  onDelete={() => handleOpenDeleteDialog(router.id)}
                />
              ))}

              <DropdownMenuSeparator />

              {/* Action buttons section */}
              <div className="flex items-center gap-1 p-1">
                <AddRouterDialog onAdd={handleAddRouter} />

                {/* Sync Data Button */}
                <DropdownMenuItem
                  className="p-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={handleSyncRouters}
                  disabled={syncing}
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-muted/50 hover:bg-muted transition-colors">
                    <RefreshCcw className={`size-3.5 transition-transform duration-300 ${syncing ? 'animate-spin' : 'hover:rotate-180'}`} />
                  </div>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <DeleteRouterDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteRouter}
      />
    </>
  )
}