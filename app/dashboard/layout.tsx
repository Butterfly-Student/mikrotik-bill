"use client"
import type React from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, User, LogOut, Settings, Loader2 } from "lucide-react"
import SetupWizard from "@/components/setup-wizard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [setupRequired, setSetupRequired] = useState(false);
  const [systemConfig, setSystemConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New update available", read: false, time: "2 min ago" },
    { id: 2, message: "System backup completed", read: true, time: "1 hour ago" },
    { id: 3, message: "New user registered", read: false, time: "3 hours ago" },
  ]);
  const { data: session, status } = useSession()
  const router = useRouter()

  // Memoize session check untuk mencegah re-render yang tidak perlu
  const isAuthenticated = useMemo(() => {
    return status === "authenticated" && session
  }, [status, session])

  const isLoading = useMemo(() => {
    return status === "loading"
  }, [status])

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    try {
      await signOut({
        callbackUrl: "/login",
        redirect: true
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  useEffect(() => {
    const checkSystemConfig = async () => {
      try {
        const res = await fetch("/api/system/config");
        console.log(res)
        // If the API failed (e.g. 5xx) just fall back to setup mode.

        if (!res.ok) {
          console.warn("system-config fetch failed with status", res.status);

          setSetupRequired(true);

          setSystemConfig(null);

          return;
        }

        const isJson = res.headers
          .get("content-type")
          ?.toLowerCase()
          .includes("application/json");

        if (!isJson) {
          // unexpected content – treat as not-configured rather than throwing

          setSetupRequired(true);

          setSystemConfig(null);

          return;
        }

        const result = await res.json();
        console.log(result)
        if (!result.success) {
          console.warn(
            "System config fetch failed:",
            result.error || result.message
          );

          setSetupRequired(true);

          setSystemConfig(null);

          return;
        }

        setSystemConfig(result.data);

        setSetupRequired(result.setupRequired || !result.data?.setup_completed);

        if (result.message) console.log("System status:", result.message);
      } catch (error) {
        // Network or unexpected error → show setup

        console.error("Failed to check system config:", error);

        setSetupRequired(true);

        setSystemConfig(null);
      } finally {
        setLoading(false);
      }
    };

    checkSystemConfig();
  }, []);

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Show setup wizard if setup required

  // if (setupRequired) {
  //   return (
  //     <SetupWizard
  //       onSetupComplete={() => {
  //         setSetupRequired(false);

  //         window.location.reload();
  //       }}
  //     />
  //   );
  // }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-1 flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>

          {/* Header Right Side - Notifications, Account Info, Logout */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Notifications
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="h-auto p-1 text-xs"
                    >
                      Mark all as read
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <DropdownMenuItem disabled>
                    No notifications
                  </DropdownMenuItem>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      onClick={() => markNotificationAsRead(notification.id)}
                      className={`flex flex-col items-start gap-1 p-3 ${!notification.read ? 'bg-blue-50' : ''
                        }`}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <span className="text-sm font-medium flex-1">
                          {notification.message}
                        </span>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {notification.time}
                      </span>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Account Info & Logout */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={session?.user?.image || ""} />
                    <AvatarFallback>
                      {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium">
                    {session?.user?.name || session?.user?.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session?.user?.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}