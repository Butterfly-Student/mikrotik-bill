"use client"
import * as React from "react"
import { BookOpen, Bot, Command, CreditCard, LifeBuoy, Send, Settings2, SquareTerminal, Users, Wifi } from "lucide-react"
import { useSession } from "next-auth/react"
import { useMemo } from "react"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { navigationConfig } from "@/config/navigation"

export const AppSidebar = React.memo(function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()

  // Helper function to check if user has permission
  const hasPermission = React.useCallback((permission: string) => {
    if (!session?.user?.permissions) return false
    return session.user.permissions.some((p) => p.name === permission)
  }, [session?.user?.permissions])

  // Memoize nav items configuration
  const allNavItems = useMemo(() => navigationConfig, [])

  // Memoize filtered nav items
  const filteredNavItems = useMemo(() => {
    return allNavItems
      .filter((item) => hasPermission(item.permission))
      .map((item) => {
        // Filter sub-items berdasarkan permission jika ada
        const filteredSubItems = item.items?.filter((subItem) => hasPermission(subItem.permission))

        return {
          ...item,
          // Jika tidak ada items asli, set undefined. Jika ada, gunakan hasil filter
          items: item.items ? filteredSubItems : undefined,
        }
      })
    // PERBAIKAN: Tidak perlu filter lagi berdasarkan items.length
    // Semua item yang sudah lolos permission check akan ditampilkan
  }, [allNavItems, hasPermission])

  console.log("Filterd nav", filteredNavItems)

  // Memoize secondary nav items
  const navSecondaryItems = useMemo(() => [
    {
      title: "Support",
      url: "/dashboard/support",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "/dashboard/feedback",
      icon: Send,
    },
  ], [])

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Your Company</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavItems} />
        <NavSecondary items={navSecondaryItems} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
})